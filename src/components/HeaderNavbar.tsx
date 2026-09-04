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
  FolderArchive,
  Save,
  Plus,
  ExternalLink,
  Table,
  RefreshCw,
  Users,
  Receipt,
} from 'lucide-react';
import { GoogleSheetsConfig } from '../types';

interface HeaderNavbarProps {
  activeTab: 'generator' | 'clients';
  onActiveTabChange: (tab: 'generator' | 'clients') => void;
  clientCount: number;
  viewMode: 'split' | 'editor' | 'preview';
  onViewModeChange: (mode: 'split' | 'editor' | 'preview') => void;
  onOpenWhatsApp: () => void;
  onDownloadPdf: () => void;
  onPrint: () => void;
  onReset: () => void;
  isGeneratingPdf: boolean;
  isSaved: boolean;
  savedCount: number;
  onOpenSavedModal: () => void;
  onSaveToHistory: () => void;
  onSyncToSheets: () => void;
  onCreateNewInvoice: () => void;
  isSyncingSheets: boolean;
  sheetsConfig: GoogleSheetsConfig | null;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeTab,
  onActiveTabChange,
  clientCount,
  viewMode,
  onViewModeChange,
  onOpenWhatsApp,
  onDownloadPdf,
  onPrint,
  onReset,
  isGeneratingPdf,
  isSaved,
  savedCount,
  onOpenSavedModal,
  onSaveToHistory,
  onSyncToSheets,
  onCreateNewInvoice,
  isSyncingSheets,
  sheetsConfig,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 lg:px-8 py-2.5 no-print shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-3">
        {/* Left: Brand / Studio Identity & Storage Quick Actions */}
        <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-start flex-wrap">
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
                Branding & Design Studio • Generator & Rekap Tagihan
              </p>
            </div>
          </div>

          <div className="h-5 w-px bg-neutral-200 hidden md:block"></div>

          {/* Primary View Switcher: Invoice Generator vs Arsip Klien */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs">
            <button
              type="button"
              onClick={() => onActiveTabChange('generator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <Receipt className={`w-3.5 h-3.5 ${activeTab === 'generator' ? 'text-[#FFD400]' : ''}`} />
              <span>Editor Invoice</span>
            </button>

            <button
              type="button"
              onClick={() => onActiveTabChange('clients')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${activeTab === 'clients' ? 'text-[#FFD400]' : ''}`} />
              <span>Arsip Klien</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'clients'
                    ? 'bg-[#FFD400] text-neutral-950'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {clientCount}
              </span>
            </button>
          </div>

          {/* Quick Storage Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={onOpenSavedModal}
              title="Lihat riwayat dan daftar invoice tersimpan"
              className="px-2.5 py-1.5 rounded-xl border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <FolderArchive className="w-3.5 h-3.5 text-neutral-700" />
              <span className="hidden md:inline">Riwayat</span>
              <span className="px-1.5 py-0.2 rounded-full bg-neutral-950 text-white text-[10px] font-mono font-bold">
                {savedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={onSyncToSheets}
              disabled={isSyncingSheets}
              title="Simpan atau sinkronkan data invoice ke Google Sheets"
              className="px-2.5 py-1.5 rounded-xl border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-60"
            >
              {isSyncingSheets ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              ) : (
                <Table className="w-3.5 h-3.5 text-emerald-700" />
              )}
              <span className="hidden sm:inline">{isSyncingSheets ? 'Menyimpan...' : 'Ke Sheets'}</span>
            </button>

            <button
              type="button"
              onClick={onCreateNewInvoice}
              title="Buat invoice baru dengan nomor urut selanjutnya"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#FFD400]" />
              <span className="hidden sm:inline">Baru</span>
            </button>
          </div>
        </div>

        {/* Center: View Switcher (Only shown when on 'generator' tab) */}
        {activeTab === 'generator' ? (
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
              <span>Preview</span>
            </button>
          </div>
        ) : (
          <div className="text-xs font-bold text-neutral-600 flex items-center gap-1.5 bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200">
            <Users className="w-3.5 h-3.5 text-neutral-900" />
            <span>Kumpulan Data Klien & Monitoring Status Tagihan</span>
          </div>
        )}

        {/* Right: Output Actions (Print, Download PDF, WhatsApp, Reset) */}
        <div className="flex items-center gap-2 w-full xl:w-auto justify-end flex-wrap">
          {activeTab === 'generator' && (
            <>
              <button
                type="button"
                onClick={onSaveToHistory}
                title="Simpan invoice saat ini ke riwayat lokal"
                className="px-2.5 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Save className="w-3.5 h-3.5 text-neutral-900" />
                <span className="hidden sm:inline">Simpan</span>
              </button>

              <button
                type="button"
                onClick={onReset}
                title="Reset ke Template Awal"
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
                <span>{isGeneratingPdf ? 'Membuat...' : 'Unduh PDF'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenWhatsApp}
                className="px-3.5 py-2 rounded-xl bg-[#FFD400] hover:bg-[#E6BE00] active:bg-[#CCAA00] text-neutral-950 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs border border-[#E6BE00]"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-neutral-950 text-neutral-950" />
                <span>Kirim ke WA</span>
              </button>
            </>
          )}

          {activeTab === 'clients' && (
            <button
              type="button"
              onClick={() => onActiveTabChange('generator')}
              className="px-3.5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Receipt className="w-3.5 h-3.5 text-[#FFD400]" />
              <span>Buka Editor Invoice</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

