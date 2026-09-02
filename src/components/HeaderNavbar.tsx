import React from 'react';
import {
  FileDown,
  Printer,
  MessageSquare,
  Columns2,
  Edit3,
  Eye,
  RotateCcw,
  Sparkles,
  Check,
} from 'lucide-react';

interface HeaderNavbarProps {
  viewMode: 'split' | 'editor' | 'preview';
  onViewModeChange: (mode: 'split' | 'editor' | 'preview') => void;
  onOpenWhatsApp: () => void;
  onDownloadPdf: () => void;
  onPrint: () => void;
  onReset: () => void;
  isGeneratingPdf: boolean;
  isSaved: boolean;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  viewMode,
  onViewModeChange,
  onOpenWhatsApp,
  onDownloadPdf,
  onPrint,
  onReset,
  isGeneratingPdf,
  isSaved,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200 px-4 lg:px-8 py-3 no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand / Studio Identity */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-display font-black text-base tracking-tighter shadow-xs relative overflow-hidden border border-neutral-800">
              <span>oi</span>
              <span className="text-[#FFD400] font-black">.</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-base tracking-tight text-neutral-950">
                  otakatikide
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFD400]/20 text-neutral-900 border border-[#FFD400]/50">
                  Invoice App
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 hidden sm:block">
                Branding & Design Studio • Generator Tagihan Resmi
              </p>
            </div>
          </div>

          {/* Auto-save badge indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">
            <span className="w-2 h-2 rounded-full bg-[#FFD400]"></span>
            <span className="hidden sm:inline">Tersimpan Otomatis</span>
          </div>
        </div>

        {/* Center: View Switcher */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs">
          <button
            type="button"
            onClick={() => onViewModeChange('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              viewMode === 'split'
                ? 'bg-neutral-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            <Columns2 className={`w-3.5 h-3.5 ${viewMode === 'split' ? 'text-[#FFD400]' : ''}`} />
            <span className="hidden sm:inline">Split View</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              viewMode === 'editor'
                ? 'bg-neutral-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            <Edit3 className={`w-3.5 h-3.5 ${viewMode === 'editor' ? 'text-[#FFD400]' : ''}`} />
            <span>Form Editor</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              viewMode === 'preview'
                ? 'bg-neutral-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            <Eye className={`w-3.5 h-3.5 ${viewMode === 'preview' ? 'text-[#FFD400]' : ''}`} />
            <span>Preview Invoice</span>
          </button>
        </div>

        {/* Right: Actions (WhatsApp, Download PDF, Print, Reset) */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={onReset}
            title="Reset ke Contoh Template Awal"
            className="p-2 rounded-xl text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 border border-neutral-200 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onPrint}
            title="Cetak via Dialog Print Browser"
            className="px-3 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-700" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 active:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50 border border-neutral-800"
          >
            <FileDown className="w-3.5 h-3.5 text-[#FFD400]" />
            <span>{isGeneratingPdf ? 'Membuat PDF...' : 'Unduh PDF'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenWhatsApp}
            className="px-3.5 py-2 rounded-xl bg-[#FFD400] hover:bg-[#E6BE00] active:bg-[#CCAA00] text-neutral-950 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs border border-[#E6BE00]"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-neutral-950 text-neutral-950" />
            <span>Kirim ke WA</span>
          </button>
        </div>
      </div>
    </header>
  );
};
