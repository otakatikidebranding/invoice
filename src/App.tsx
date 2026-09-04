import React, { useState, useEffect, useMemo } from 'react';
import { InvoiceData, SavedInvoice, GoogleSheetsConfig } from './types';
import { INITIAL_INVOICE_DATA } from './utils/presets';
import { calculateInvoice, formatRupiah } from './utils/formatters';
import { HeaderNavbar } from './components/HeaderNavbar';
import { FormEditor } from './components/FormEditor';
import { InvoicePaper } from './components/InvoicePaper';
import { WhatsAppModal } from './components/WhatsAppModal';
import { SavedInvoicesModal } from './components/SavedInvoicesModal';
import { ClientArchiveView } from './components/ClientArchiveView';
import { exportInvoiceToPdf } from './utils/pdfGenerator';
import {
  getSavedInvoices,
  saveInvoiceToStorage,
  deleteSavedInvoiceFromStorage,
  markInvoiceSyncedInStorage,
  generateNextInvoiceNumber,
} from './utils/invoiceStorage';
import {
  requestGoogleAccessToken,
  saveInvoiceToGoogleSheet,
  syncAllInvoicesToGoogleSheet,
  getStoredSpreadsheetConfig,
} from './utils/googleSheets';
import {
  FileText,
  MessageSquare,
  Sparkles,
  Download,
  Printer,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Table,
  CheckCircle2,
  X,
} from 'lucide-react';

const STORAGE_KEY = 'otakatikide_invoice_data_v1';

export default function App() {
  const [invoice, setInvoice] = useState<InvoiceData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.terms)) {
          parsed.terms = parsed.terms.filter(
            (t: string) => !t.includes('3x putaran revisi minor')
          );
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved invoice from localStorage:', e);
    }
    return INITIAL_INVOICE_DATA;
  });

  const [mainTab, setMainTab] = useState<'generator' | 'clients'>('generator');
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved Invoices & Google Sheets state
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>(() => {
    const list = getSavedInvoices();
    if (list.length === 0) {
      // Seed initial invoice so history starts with a sample
      const initialSaved = saveInvoiceToStorage(INITIAL_INVOICE_DATA);
      return [initialSaved];
    }
    return list;
  });

  // Calculate unique clients count
  const uniqueClientsCount = useMemo(() => {
    const set = new Set<string>();
    savedInvoices.forEach((inv) => {
      const name = (inv.clientName || 'Tanpa Nama').trim().toLowerCase();
      const comp = (inv.clientCompany || '').trim().toLowerCase();
      set.add(`${name}___${comp}`);
    });
    return set.size;
  }, [savedInvoices]);

  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig | null>(() =>
    getStoredSpreadsheetConfig()
  );
  const [sheetsNotification, setSheetsNotification] = useState<{
    message: string;
    url: string;
  } | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoice));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }, [invoice]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleSaveToHistory = () => {
    const saved = saveInvoiceToStorage(invoice);
    setSavedInvoices(getSavedInvoices());
    showToast(`✅ Invoice ${invoice.invoiceNumber} berhasil disimpan ke Riwayat!`);
  };

  const handleSyncCurrentToSheets = async () => {
    try {
      setIsSyncingSheets(true);
      showToast('Menghubungkan akun Google...');

      const token = await requestGoogleAccessToken();
      showToast('Menyimpan data invoice ke Google Sheets...');

      const result = await saveInvoiceToGoogleSheet(token, invoice, sheetsConfig?.spreadsheetId);

      // Mark as synced locally
      markInvoiceSyncedInStorage(invoice.invoiceNumber);
      saveInvoiceToStorage(invoice, true);
      setSavedInvoices(getSavedInvoices());

      const updatedConfig = getStoredSpreadsheetConfig();
      if (updatedConfig) setSheetsConfig(updatedConfig);

      setSheetsNotification({
        message: `Invoice ${invoice.invoiceNumber} berhasil ${result.isNewRow ? 'ditambahkan' : 'diperbarui'} di Google Sheets!`,
        url: result.spreadsheetUrl,
      });

      showToast(`✅ Berhasil dicatat di Google Sheets!`);
    } catch (err: unknown) {
      console.error('Google Sheets sync error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal';
      showToast(`❌ Gagal menyimpan ke Sheets: ${errorMessage}`);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleSyncSingleInvoiceFromModal = async (targetInvoice: InvoiceData) => {
    try {
      setIsSyncingSheets(true);
      const token = await requestGoogleAccessToken();
      const result = await saveInvoiceToGoogleSheet(token, targetInvoice, sheetsConfig?.spreadsheetId);

      markInvoiceSyncedInStorage(targetInvoice.invoiceNumber);
      saveInvoiceToStorage(targetInvoice, true);
      setSavedInvoices(getSavedInvoices());

      const updatedConfig = getStoredSpreadsheetConfig();
      if (updatedConfig) setSheetsConfig(updatedConfig);

      setSheetsNotification({
        message: `Invoice ${targetInvoice.invoiceNumber} berhasil dicatat di Google Sheets!`,
        url: result.spreadsheetUrl,
      });

      showToast(`✅ ${targetInvoice.invoiceNumber} tersinkron ke Google Sheets!`);
    } catch (err: unknown) {
      console.error('Sync error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal';
      showToast(`❌ Gagal: ${errorMessage}`);
      throw err;
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleSyncAllToSheets = async () => {
    try {
      setIsSyncingSheets(true);
      showToast('Menghubungkan ke Google...');

      const token = await requestGoogleAccessToken();
      showToast('Menyinkronkan seluruh daftar invoice ke Google Sheets...');

      // Ensure active invoice is saved first
      saveInvoiceToStorage(invoice);
      const currentSavedList = getSavedInvoices();
      const allInvoices = currentSavedList.map((s) => s.data);

      const result = await syncAllInvoicesToGoogleSheet(token, allInvoices);

      // Update sync timestamps
      currentSavedList.forEach((item) => markInvoiceSyncedInStorage(item.invoiceNumber));
      setSavedInvoices(getSavedInvoices());

      const updatedConfig = getStoredSpreadsheetConfig();
      if (updatedConfig) setSheetsConfig(updatedConfig);

      setSheetsNotification({
        message: `Berhasil menyinkronkan ${result.count} invoice ke spreadsheet Google!`,
        url: result.spreadsheetUrl,
      });

      showToast(`✅ ${result.count} invoice berhasil dicatat di Google Sheets!`);
    } catch (err: unknown) {
      console.error('Bulk sync error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal';
      showToast(`❌ Gagal sinkronisasi masal: ${errorMessage}`);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleCreateNewInvoice = () => {
    // Save current active invoice first
    saveInvoiceToStorage(invoice);
    setSavedInvoices(getSavedInvoices());

    const nextNumber = generateNextInvoiceNumber(invoice.invoiceNumber);
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newInvoice: InvoiceData = {
      ...INITIAL_INVOICE_DATA,
      invoiceNumber: nextNumber,
      invoiceDate: today,
      dueDate: nextWeek,
      client: {
        name: '',
        company: '',
        whatsapp: '',
        email: '',
        address: '',
      },
      items: [
        {
          id: `item_${Date.now()}`,
          description: 'Brand Identity Design',
          details: 'Konsep logo, palet warna, dan aset vector siap pakai',
          qty: 1,
          price: 2500000,
        },
      ],
      paymentStatus: 'draft',
      dpReceivedDate: '',
      finalReceivedDate: '',
    };

    setInvoice(newInvoice);
    setMainTab('generator');
    showToast(`✨ Invoice baru siap diedit: ${nextNumber}`);
  };

  const handleCreateInvoiceForClient = (clientInfo: {
    name: string;
    company?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
  }) => {
    saveInvoiceToStorage(invoice);
    setSavedInvoices(getSavedInvoices());

    const nextNumber = generateNextInvoiceNumber(invoice.invoiceNumber);
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newInvoice: InvoiceData = {
      ...INITIAL_INVOICE_DATA,
      invoiceNumber: nextNumber,
      invoiceDate: today,
      dueDate: nextWeek,
      client: {
        name: clientInfo.name,
        company: clientInfo.company || '',
        whatsapp: clientInfo.whatsapp || '',
        email: clientInfo.email || '',
        address: clientInfo.address || '',
      },
      items: [
        {
          id: `item_${Date.now()}`,
          description: 'Desain Brand Identity / Layanan Kreatif Baru',
          details: 'Pengerjaan sesuai kesepakatan spesifikasi proyek',
          qty: 1,
          price: 1500000,
        },
      ],
      paymentStatus: 'draft',
      dpReceivedDate: '',
      finalReceivedDate: '',
    };

    setInvoice(newInvoice);
    setMainTab('generator');
    showToast(`✨ Invoice baru ${nextNumber} disiapkan untuk klien ${clientInfo.name}`);
  };

  const handleDuplicateInvoice = (target: InvoiceData) => {
    const nextNumber = generateNextInvoiceNumber(target.invoiceNumber);
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const duplicated: InvoiceData = {
      ...target,
      invoiceNumber: nextNumber,
      invoiceDate: today,
      dueDate: nextWeek,
      paymentStatus: 'draft',
      dpReceivedDate: '',
      finalReceivedDate: '',
    };

    saveInvoiceToStorage(duplicated);
    setSavedInvoices(getSavedInvoices());
    setInvoice(duplicated);
    setMainTab('generator');
    showToast(`📋 Invoice diduplikasi sebagai draft: ${nextNumber}`);
  };

  const handleLoadInvoice = (target: InvoiceData) => {
    // Save current active before switching
    saveInvoiceToStorage(invoice);
    setSavedInvoices(getSavedInvoices());

    setInvoice(target);
    setMainTab('generator');
    showToast(`📂 Invoice ${target.invoiceNumber} berhasil dibuka di editor.`);
  };

  const handleDeleteInvoice = (id: string) => {
    const updated = deleteSavedInvoiceFromStorage(id);
    setSavedInvoices(updated);
    showToast('Invoice dihapus dari riwayat.');
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    showToast('Sedang membuat file PDF invoice...');

    const originalMode = viewMode;
    if (viewMode === 'editor') {
      setViewMode('preview');
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const filename = `Invoice-${invoice.studio.name}-${invoice.invoiceNumber || 'INV-001'}`;
    const success = await exportInvoiceToPdf('invoice-document', filename);

    setIsGeneratingPdf(false);
    if (success) {
      showToast('✅ Berhasil mengunduh PDF Invoice!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin me-reset data ke template awal studio otakatikide?')) {
      setInvoice(INITIAL_INVOICE_DATA);
      showToast('Data invoice berhasil di-reset.');
    }
  };

  const handleUpdateClientPhone = (phone: string) => {
    setInvoice((prev) => ({
      ...prev,
      client: { ...prev.client, whatsapp: phone },
    }));
  };

  const handleOpenWhatsAppForInvoice = (targetInvoice: InvoiceData) => {
    setInvoice(targetInvoice);
    setIsWhatsAppOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-950 text-white px-4 py-3 rounded-xl shadow-2xl border border-neutral-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 no-print">
          <Sparkles className="w-4 h-4 text-[#FFD400] fill-[#FFD400]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Google Sheets Success Banner (Persistent until dismissed) */}
      {sheetsNotification && (
        <div className="bg-emerald-900 text-white px-4 py-2.5 text-xs border-b border-emerald-800 flex items-center justify-between gap-3 shadow-xs no-print animate-in fade-in">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FFD400] shrink-0" />
              <span className="font-semibold">{sheetsNotification.message}</span>
              <a
                href={sheetsNotification.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold rounded-lg transition border border-emerald-600"
              >
                <span>Buka Google Sheets</span>
                <ExternalLink className="w-3 h-3 text-[#FFD400]" />
              </a>
            </div>
            <button
              type="button"
              onClick={() => setSheetsNotification(null)}
              className="p-1 rounded-md hover:bg-emerald-800 text-emerald-200 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <HeaderNavbar
        activeTab={mainTab}
        onActiveTabChange={setMainTab}
        clientCount={uniqueClientsCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
        onDownloadPdf={handleDownloadPdf}
        onPrint={handlePrint}
        onReset={handleReset}
        isGeneratingPdf={isGeneratingPdf}
        isSaved={true}
        savedCount={savedInvoices.length}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onSaveToHistory={handleSaveToHistory}
        onSyncToSheets={handleSyncCurrentToSheets}
        onCreateNewInvoice={handleCreateNewInvoice}
        isSyncingSheets={isSyncingSheets}
        sheetsConfig={sheetsConfig}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 print:p-0 print:m-0 print:max-w-full">
        {mainTab === 'clients' ? (
          <ClientArchiveView
            savedInvoices={savedInvoices}
            onLoadInvoice={handleLoadInvoice}
            onCreateInvoiceForClient={handleCreateInvoiceForClient}
            onOpenWhatsApp={handleOpenWhatsAppForInvoice}
            onBackToBuilder={() => setMainTab('generator')}
          />
        ) : (
          <>
            {/* Quick studio notice strip */}
            <div className="mb-4 bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs no-print">
              <div className="flex items-center gap-2.5 text-neutral-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFD400] ring-4 ring-[#FFD400]/20 animate-pulse"></span>
                <span className="font-bold text-neutral-950">Studio otakatikide</span>
                <span className="text-neutral-300">•</span>
                <span className="text-neutral-600 font-medium">Invoice Generator & Google Sheets Sync</span>
                {sheetsConfig && (
                  <a
                    href={sheetsConfig.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 transition"
                  >
                    <Table className="w-3 h-3 text-emerald-600" />
                    <span>Terhubung ke Sheets</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-4 text-neutral-600 text-[11px]">
                <span>
                  Skema:{' '}
                  <strong className="text-neutral-950 font-bold">
                    {invoice.paymentScheme === 'dp_50'
                      ? 'DP 50% & Pelunasan'
                      : invoice.paymentScheme === 'dp_custom'
                      ? `DP Custom (${formatRupiah(calculateInvoice(invoice).dpAmount)})`
                      : 'Full Payment 100%'}
                  </strong>
                </span>
                <span>
                  Status:{' '}
                  <strong className="text-neutral-950 font-bold uppercase bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                    {invoice.paymentStatus === 'paid'
                      ? 'Lunas'
                      : invoice.paymentStatus === 'dp_paid'
                      ? invoice.paymentScheme === 'dp_custom'
                        ? 'DP Custom Paid'
                        : 'DP 50% Paid'
                      : 'Draft / Unpaid'}
                  </strong>
                </span>
              </div>
            </div>

            {/* View Layout Switcher */}
            {viewMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:block">
                {/* Left: Form Editor (5 cols on lg) */}
                <div className="lg:col-span-6 xl:col-span-5 space-y-4 no-print">
                  <FormEditor invoice={invoice} onChange={setInvoice} />
                </div>

                {/* Right: Live Invoice Paper Preview (7 cols on lg) */}
                <div className="lg:col-span-6 xl:col-span-7 sticky top-20 print:static print:w-full print:m-0 print:p-0">
                  <div className="invoice-container-wrapper bg-neutral-200/70 p-3 sm:p-6 rounded-2xl border border-neutral-300 shadow-inner flex flex-col items-center justify-center overflow-x-auto print:bg-transparent print:p-0 print:border-none print:shadow-none print:rounded-none print:m-0">
                    <div className="w-full flex justify-between items-center pb-3 text-xs text-neutral-600 font-medium px-2 no-print">
                      <span className="flex items-center gap-1.5 font-semibold text-neutral-900">
                        <FileText className="w-3.5 h-3.5" />
                        Live Invoice Preview (A4 Paper)
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Siap dicetak & diunduh
                      </span>
                    </div>
                    <InvoicePaper invoice={invoice} />
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'editor' && (
              <div className="max-w-3xl mx-auto space-y-4 no-print">
                <FormEditor invoice={invoice} onChange={setInvoice} />
              </div>
            )}

            {viewMode === 'preview' && (
              <div className="max-w-4xl mx-auto space-y-4 print:max-w-full print:m-0 print:p-0">
                <div className="invoice-container-wrapper bg-neutral-200/70 p-3 sm:p-8 rounded-2xl border border-neutral-300 shadow-inner flex flex-col items-center justify-center overflow-x-auto print:bg-transparent print:p-0 print:border-none print:shadow-none print:rounded-none print:m-0">
                  <InvoicePaper invoice={invoice} />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        invoice={invoice}
        onUpdateClientPhone={handleUpdateClientPhone}
      />

      {/* Saved Invoices History & Google Sheets Sync Modal */}
      <SavedInvoicesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedInvoices={savedInvoices}
        currentInvoiceNumber={invoice.invoiceNumber}
        onLoadInvoice={handleLoadInvoice}
        onDeleteInvoice={handleDeleteInvoice}
        onDuplicateInvoice={handleDuplicateInvoice}
        onCreateNewInvoice={handleCreateNewInvoice}
        onSyncInvoiceToSheets={handleSyncSingleInvoiceFromModal}
        onSyncAllToSheets={handleSyncAllToSheets}
        sheetsConfig={sheetsConfig}
        isSyncingSheets={isSyncingSheets}
      />
    </div>
  );
}

