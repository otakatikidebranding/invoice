import { GoogleSheetsConfig, InvoiceData } from '../types';
import { calculateInvoice, formatDateIndo } from './formatters';

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; expires_in?: number }) => void;
            error_callback?: (err: unknown) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

// Client ID configured from Google Cloud / OAuth setup
const FALLBACK_CLIENT_ID = '268323746886-faf3ndil440j40ujcn9kcoh7m080ms4u.apps.googleusercontent.com';
const SHEETS_CONFIG_STORAGE_KEY = 'otakatikide_google_sheets_config';
const OAUTH_SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';
const SHEET_TAB_NAME = 'Rekap Invoice';

export const SHEET_HEADERS = [
  'No. Invoice',
  'Tanggal Invoice',
  'Jatuh Tempo',
  'Nama Klien',
  'Perusahaan / Bisnis',
  'No. WhatsApp',
  'Email Klien',
  'Total Project (IDR)',
  'Skema Pembayaran',
  'Nominal DP (IDR)',
  'Sisa Pelunasan (IDR)',
  'Status Tagihan',
  'Tgl DP Diterima',
  'Tgl Pelunasan',
  'Rincian Item / Layanan',
  'Terakhir Diperbarui',
];

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export function getStoredSpreadsheetConfig(): GoogleSheetsConfig | null {
  try {
    const raw = localStorage.getItem(SHEETS_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredSpreadsheetConfig(config: GoogleSheetsConfig): void {
  try {
    localStorage.setItem(SHEETS_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save spreadsheet config:', err);
  }
}

export function clearStoredSpreadsheetConfig(): void {
  try {
    localStorage.removeItem(SHEETS_CONFIG_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear spreadsheet config:', err);
  }
}

/**
 * Request OAuth 2.0 Access Token from Google Identity Services (GSI)
 */
export async function requestGoogleAccessToken(): Promise<string> {
  // Check if token is still valid
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  // Ensure GSI script is loaded
  if (!window.google?.accounts?.oauth2) {
    await new Promise<void>((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval);
          resolve();
        } else if (attempts > 30) {
          clearInterval(interval);
          reject(new Error('Google Identity Services script gagal dimuat. Periksa koneksi internet Anda.'));
        }
      }, 100);
    });
  }

  return new Promise<string>((resolve, reject) => {
    try {
      const client = window.google!.accounts!.oauth2!.initTokenClient({
        client_id: FALLBACK_CLIENT_ID,
        scope: OAUTH_SCOPES,
        callback: (response) => {
          if (response.error) {
            reject(new Error(`Otorisasi Google gagal: ${response.error}`));
            return;
          }
          if (response.access_token) {
            cachedToken = response.access_token;
            // expires_in is typically in seconds (default 3600)
            const expiresInSec = response.expires_in || 3600;
            tokenExpiresAt = Date.now() + (expiresInSec - 60) * 1000;
            resolve(response.access_token);
          } else {
            reject(new Error('Tidak ada token akses yang diterima dari Google.'));
          }
        },
        error_callback: (err) => {
          reject(err instanceof Error ? err : new Error('Gagal membuka popup autentikasi Google.'));
        },
      });

      client.requestAccessToken({ prompt: cachedToken ? '' : 'select_account' });
    } catch (err) {
      reject(err instanceof Error ? err : new Error('Terjadi kesalahan saat memulai autentikasi Google.'));
    }
  });
}

/**
 * Format the header row with high-contrast styling (yellow/black branding)
 */
async function formatSpreadsheetHeader(accessToken: string, spreadsheetId: string, sheetId = 0): Promise<void> {
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          // Format header row: bold, background neutral-900, text white
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: SHEET_HEADERS.length,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.08, green: 0.08, blue: 0.08 },
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 1.0, green: 0.83, blue: 0.0 }, // otakatikide yellow
                    fontSize: 10,
                  },
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE',
                  padding: { top: 6, bottom: 6, left: 8, right: 8 },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding)',
            },
          },
          // Auto-resize columns
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: SHEET_HEADERS.length,
              },
            },
          },
        ],
      }),
    });
  } catch (err) {
    console.warn('Could not format header row, continuing:', err);
  }
}

/**
 * Find existing spreadsheet or create a new one dedicated to otakatikide Invoice
 */
export async function findOrCreateInvoiceSpreadsheet(accessToken: string): Promise<GoogleSheetsConfig> {
  const existingConfig = getStoredSpreadsheetConfig();

  // Validate existing config if present
  if (existingConfig && existingConfig.spreadsheetId) {
    try {
      const checkRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${existingConfig.spreadsheetId}?fields=spreadsheetId,properties.title`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (checkRes.ok) {
        return existingConfig;
      }
    } catch {
      // If check fails, we'll search or create anew
    }
  }

  // Search Drive for file with title "Rekap Invoice - otakatikide Studio"
  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name%3D'Rekap+Invoice+-+otakatikide+Studio'+and+trashed%3Dfalse&fields=files(id,name,webViewLink)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const found = searchData.files[0];
        const config: GoogleSheetsConfig = {
          spreadsheetId: found.id,
          spreadsheetUrl: found.webViewLink || `https://docs.google.com/spreadsheets/d/${found.id}/edit`,
          spreadsheetTitle: found.name,
        };
        saveStoredSpreadsheetConfig(config);
        return config;
      }
    }
  } catch (err) {
    console.warn('Drive search error, falling back to creating new sheet:', err);
  }

  // Create new spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'Rekap Invoice - otakatikide Studio',
      },
      sheets: [
        {
          properties: {
            title: SHEET_TAB_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorBody = await createRes.text();
    throw new Error(`Gagal membuat Google Spreadsheet baru: ${errorBody}`);
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write header row
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_TAB_NAME}'!A1:P1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [SHEET_HEADERS],
      }),
    }
  );

  // Format header row
  const sheetId = createdData.sheets?.[0]?.properties?.sheetId || 0;
  await formatSpreadsheetHeader(accessToken, spreadsheetId, sheetId);

  const newConfig: GoogleSheetsConfig = {
    spreadsheetId,
    spreadsheetUrl,
    spreadsheetTitle: 'Rekap Invoice - otakatikide Studio',
    lastSyncedAt: new Date().toISOString(),
  };

  saveStoredSpreadsheetConfig(newConfig);
  return newConfig;
}

/**
 * Transform InvoiceData into a spreadsheet row array matching SHEET_HEADERS
 */
export function invoiceToSheetRow(invoice: InvoiceData): (string | number)[] {
  const calc = calculateInvoice(invoice);

  let schemeText = 'Sistem DP 50%';
  if (invoice.paymentScheme === 'dp_custom') {
    schemeText = 'Sistem DP Khusus';
  } else if (invoice.paymentScheme === 'full') {
    schemeText = 'Pembayaran Penuh (100%)';
  }

  let statusText = 'MENUNGGU PEMBAYARAN';
  if (invoice.paymentStatus === 'paid') {
    statusText = 'LUNAS (100%)';
  } else if (invoice.paymentStatus === 'dp_paid') {
    statusText = 'DP DIBAYAR (Menunggu Pelunasan)';
  }

  const itemSummary = invoice.items
    .map((item, idx) => `${idx + 1}. ${item.description} (x${item.qty})`)
    .join('; ');

  return [
    invoice.invoiceNumber,
    invoice.invoiceDate,
    invoice.dueDate,
    invoice.client.name,
    invoice.client.company || '-',
    invoice.client.whatsapp || '-',
    invoice.client.email || '-',
    calc.grandTotal,
    schemeText,
    calc.dpAmount,
    calc.remainingAmount,
    statusText,
    invoice.dpReceivedDate ? formatDateIndo(invoice.dpReceivedDate) : '-',
    invoice.finalReceivedDate ? formatDateIndo(invoice.finalReceivedDate) : '-',
    itemSummary || '-',
    new Date().toLocaleString('id-ID'),
  ];
}

/**
 * Save or update single invoice row in Google Sheets
 */
export async function saveInvoiceToGoogleSheet(
  accessToken: string,
  invoice: InvoiceData,
  explicitSpreadsheetId?: string
): Promise<{ success: boolean; spreadsheetUrl: string; isNewRow: boolean; rowNumber: number }> {
  let config: GoogleSheetsConfig;
  if (explicitSpreadsheetId) {
    config = {
      spreadsheetId: explicitSpreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${explicitSpreadsheetId}/edit`,
      spreadsheetTitle: 'Rekap Invoice - otakatikide Studio',
    };
  } else {
    config = await findOrCreateInvoiceSpreadsheet(accessToken);
  }

  const spreadsheetId = config.spreadsheetId;
  const rowData = invoiceToSheetRow(invoice);

  // Fetch column A to check if invoice already exists
  const getRowsRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_TAB_NAME}'!A:A`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  let targetRow = -1;
  if (getRowsRes.ok) {
    const data = await getRowsRes.json();
    const rows = data.values as string[][] | undefined;
    if (rows && rows.length > 0) {
      for (let i = 0; i < rows.length; i++) {
        const rowVal = rows[i]?.[0];
        if (rowVal && rowVal.trim().toLowerCase() === invoice.invoiceNumber.trim().toLowerCase()) {
          targetRow = i + 1; // 1-indexed row number
          break;
        }
      }
    }
  }

  if (targetRow > 1) {
    // Update existing row
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_TAB_NAME}'!A${targetRow}:P${targetRow}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowData],
        }),
      }
    );

    if (!updateRes.ok) {
      throw new Error(`Gagal memperbarui baris spreadsheet: ${await updateRes.text()}`);
    }

    config.lastSyncedAt = new Date().toISOString();
    saveStoredSpreadsheetConfig(config);

    return {
      success: true,
      spreadsheetUrl: config.spreadsheetUrl,
      isNewRow: false,
      rowNumber: targetRow,
    };
  } else {
    // Append new row
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_TAB_NAME}'!A:P:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowData],
        }),
      }
    );

    if (!appendRes.ok) {
      throw new Error(`Gagal menambahkan baris ke spreadsheet: ${await appendRes.text()}`);
    }

    config.lastSyncedAt = new Date().toISOString();
    saveStoredSpreadsheetConfig(config);

    return {
      success: true,
      spreadsheetUrl: config.spreadsheetUrl,
      isNewRow: true,
      rowNumber: targetRow > 0 ? targetRow : 2,
    };
  }
}

/**
 * Bulk sync all saved invoices to Google Sheets
 */
export async function syncAllInvoicesToGoogleSheet(
  accessToken: string,
  invoices: InvoiceData[]
): Promise<{ count: number; spreadsheetUrl: string }> {
  if (invoices.length === 0) {
    const config = await findOrCreateInvoiceSpreadsheet(accessToken);
    return { count: 0, spreadsheetUrl: config.spreadsheetUrl };
  }

  const config = await findOrCreateInvoiceSpreadsheet(accessToken);
  const spreadsheetId = config.spreadsheetId;

  // Retrieve all existing invoices in Column A
  const getRowsRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_TAB_NAME}'!A:A`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const existingMap = new Map<string, number>();
  if (getRowsRes.ok) {
    const data = await getRowsRes.json();
    const rows = data.values as string[][] | undefined;
    if (rows && rows.length > 0) {
      for (let i = 0; i < rows.length; i++) {
        const val = rows[i]?.[0];
        if (val) {
          existingMap.set(val.trim().toLowerCase(), i + 1);
        }
      }
    }
  }

  const rowsToAppend: (string | number)[][] = [];

  for (const inv of invoices) {
    const key = inv.invoiceNumber.trim().toLowerCase();
    const rowData = invoiceToSheetRow(inv);
    const existingRow = existingMap.get(key);

    if (existingRow && existingRow > 1) {
      // Update individual row
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_TAB_NAME}'!A${existingRow}:P${existingRow}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [rowData],
          }),
        }
      );
    } else {
      rowsToAppend.push(rowData);
    }
  }

  if (rowsToAppend.length > 0) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_TAB_NAME}'!A:P:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: rowsToAppend,
        }),
      }
    );
  }

  config.lastSyncedAt = new Date().toISOString();
  saveStoredSpreadsheetConfig(config);

  return {
    count: invoices.length,
    spreadsheetUrl: config.spreadsheetUrl,
  };
}
