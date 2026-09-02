import React, { useState, useEffect } from 'react';
import { InvoiceData } from './types';
import { INITIAL_INVOICE_DATA } from './utils/presets';
import { HeaderNavbar } from './components/HeaderNavbar';
import { FormEditor } from './components/FormEditor';
import { InvoicePaper } from './components/InvoicePaper';
import { WhatsAppModal } from './components/WhatsAppModal';
import { exportInvoiceToPdf } from './utils/pdfGenerator';
import {
  FileText,
  MessageSquare,
  Sparkles,
  Download,
  Printer,
  CheckCircle,
  AlertCircle,
  HelpCircle,
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

  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    }, 3000);
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    showToast('Sedang membuat file PDF invoice...');
    
    // Ensure invoice preview element is visible if on mobile or editor-only view
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

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-950 text-white px-4 py-3 rounded-xl shadow-2xl border border-neutral-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 no-print">
          <Sparkles className="w-4 h-4 text-[#FFD400] fill-[#FFD400]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <HeaderNavbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
        onDownloadPdf={handleDownloadPdf}
        onPrint={handlePrint}
        onReset={handleReset}
        isGeneratingPdf={isGeneratingPdf}
        isSaved={true}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6">
        {/* Quick studio notice strip */}
        <div className="mb-4 bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2.5 text-neutral-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD400] ring-4 ring-[#FFD400]/20 animate-pulse"></span>
            <span className="font-bold text-neutral-950">Studio otakatikide</span>
            <span className="text-neutral-300">•</span>
            <span className="text-neutral-600 font-medium">Branding & Design System Invoice Builder</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-600 text-[11px]">
            <span>
              Skema:{' '}
              <strong className="text-neutral-950 font-bold">
                {invoice.paymentScheme === 'dp_50' ? 'DP 50% & Pelunasan' : 'Full Payment 100%'}
              </strong>
            </span>
            <span>
              Status:{' '}
              <strong className="text-neutral-950 font-bold uppercase bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                {invoice.paymentStatus === 'paid'
                  ? 'Lunas'
                  : invoice.paymentStatus === 'dp_paid'
                  ? 'DP 50% Paid'
                  : 'Draft / Unpaid'}
              </strong>
            </span>
          </div>
        </div>

        {/* View Layout Switcher */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Form Editor (5 cols on lg) */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-4">
              <FormEditor invoice={invoice} onChange={setInvoice} />
            </div>

            {/* Right: Live Invoice Paper Preview (7 cols on lg) */}
            <div className="lg:col-span-6 xl:col-span-7 sticky top-20">
              <div className="bg-neutral-200/70 p-3 sm:p-6 rounded-2xl border border-neutral-300 shadow-inner flex flex-col items-center justify-center overflow-x-auto">
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
          <div className="max-w-3xl mx-auto space-y-4">
            <FormEditor invoice={invoice} onChange={setInvoice} />
          </div>
        )}

        {viewMode === 'preview' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-neutral-200/70 p-3 sm:p-8 rounded-2xl border border-neutral-300 shadow-inner flex flex-col items-center justify-center overflow-x-auto">
              <InvoicePaper invoice={invoice} />
            </div>
          </div>
        )}
      </main>

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        invoice={invoice}
        onUpdateClientPhone={handleUpdateClientPhone}
      />
    </div>
  );
}
