import { InvoiceData, SavedInvoice } from '../types';
import { calculateInvoice } from './formatters';

const STORAGE_KEY = 'otakatikide_saved_invoices';

export function getSavedInvoices(): SavedInvoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: SavedInvoice[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to parse saved invoices:', err);
    return [];
  }
}

export function saveInvoiceToStorage(invoice: InvoiceData, isSynced = false): SavedInvoice {
  const currentList = getSavedInvoices();
  const calc = calculateInvoice(invoice);

  const projectSummary = invoice.items.length > 0 
    ? invoice.items.map(i => i.description).slice(0, 2).join(', ') + (invoice.items.length > 2 ? ` (+${invoice.items.length - 2} item)` : '')
    : 'Proyek Desain & Branding';

  const existingIndex = currentList.findIndex(
    item => item.invoiceNumber.trim().toLowerCase() === invoice.invoiceNumber.trim().toLowerCase()
  );

  const savedRecord: SavedInvoice = {
    id: existingIndex >= 0 ? currentList[existingIndex].id : `inv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.client.name,
    clientCompany: invoice.client.company,
    projectSummary,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    grandTotal: calc.grandTotal,
    remainingAmount: calc.remainingAmount,
    paymentScheme: invoice.paymentScheme,
    paymentStatus: invoice.paymentStatus,
    updatedAt: new Date().toISOString(),
    data: invoice,
    syncedToSheetsAt: isSynced ? new Date().toISOString() : (existingIndex >= 0 ? currentList[existingIndex].syncedToSheetsAt : undefined),
  };

  let updatedList: SavedInvoice[];
  if (existingIndex >= 0) {
    updatedList = [...currentList];
    updatedList[existingIndex] = savedRecord;
  } else {
    updatedList = [savedRecord, ...currentList];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Failed to save invoices to localStorage:', err);
  }

  return savedRecord;
}

export function deleteSavedInvoiceFromStorage(id: string): SavedInvoice[] {
  const currentList = getSavedInvoices();
  const filtered = currentList.filter(item => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete invoice from localStorage:', err);
  }
  return filtered;
}

export function markInvoiceSyncedInStorage(invoiceNumber: string): void {
  const currentList = getSavedInvoices();
  const target = currentList.find(
    i => i.invoiceNumber.trim().toLowerCase() === invoiceNumber.trim().toLowerCase()
  );
  if (target) {
    target.syncedToSheetsAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));
    } catch (err) {
      console.error('Failed to update sync timestamp in storage:', err);
    }
  }
}

export function generateNextInvoiceNumber(existingNumber?: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const saved = getSavedInvoices();
  const pattern = new RegExp(`INV/OAI/${year}/${month}/(\\d+)`, 'i');
  
  let highestSequence = 0;
  for (const inv of saved) {
    const match = inv.invoiceNumber.match(pattern);
    if (match && match[1]) {
      const seq = parseInt(match[1], 10);
      if (!isNaN(seq) && seq > highestSequence) {
        highestSequence = seq;
      }
    }
  }

  if (existingNumber) {
    const match = existingNumber.match(pattern);
    if (match && match[1]) {
      const seq = parseInt(match[1], 10);
      if (!isNaN(seq) && seq > highestSequence) {
        highestSequence = seq;
      }
    }
  }

  const nextSeq = String(highestSequence + 1).padStart(3, '0');
  return `INV/OAI/${year}/${month}/${nextSeq}`;
}
