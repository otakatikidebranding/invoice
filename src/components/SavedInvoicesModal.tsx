import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  FolderArchive,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  Trash2,
  Copy,
  ArrowUpRight,
  RefreshCw,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { SavedInvoice, InvoiceData, GoogleSheetsConfig } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface SavedInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedInvoices: SavedInvoice[];
  currentInvoiceNumber: string;
  onLoadInvoice: (invoice: InvoiceData) => void;
  onDeleteInvoice: (id: string) => void;
  onDuplicateInvoice: (invoice: InvoiceData) => void;
  onCreateNewInvoice: () => void;
  onSyncInvoiceToSheets: (invoice: InvoiceData) => Promise<void>;
  onSyncAllToSheets: () => Promise<void>;
  sheetsConfig: GoogleSheetsConfig | null;
  isSyncingSheets: boolean;
}

export const SavedInvoicesModal: React.FC<SavedInvoicesModalProps> = ({
  isOpen,
  onClose,
  savedInvoices,
  currentInvoiceNumber,
  onLoadInvoice,
  onDeleteInvoice,
  onDuplicateInvoice,
  onCreateNewInvoice,
  onSyncInvoiceToSheets,
  onSyncAllToSheets,
  sheetsConfig,
  isSyncingSheets,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [syncingSingleInvNo, setSyncingSingleInvNo] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return savedInvoices;
    const query = searchQuery.toLowerCase();
    return savedInvoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.clientName.toLowerCase().includes(query) ||
        (inv.clientCompany && inv.clientCompany.toLowerCase().includes(query)) ||
        (inv.projectSummary && inv.projectSummary.toLowerCase().includes(query))
    );
  }, [savedInvoices, searchQuery]);

  if (!isOpen) return null;

  const handleSyncSingle = async (invoice: InvoiceData) => {
    setSyncingSingleInvNo(invoice.invoiceNumber);
    try {
      await onSyncInvoiceToSheets(invoice);
    } finally {
      setSyncingSingleInvNo(null);
    }
  };

  const renderStatusBadge = (inv: SavedInvoice) => {
    switch (inv.paymentStatus) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
            LUNAS 100%
          </span>
        );
      case 'dp_paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-[#FFD400] border border-neutral-900">
            <Clock className="w-2.5 h-2.5 text-[#FFD400]" />
            DP DIBAYAR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300">
            <FileCheck className="w-2.5 h-2.5 text-amber-900" />
            MENUNGGU BAYAR
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-neutral-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs">
              <FolderArchive className="w-5 h-5 text-[#FFD400]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-extrabold text-neutral-950">
                  Riwayat & Data Invoice
                </h2>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-neutral-950 text-white font-mono">
                  {savedInvoices.length} Tersimpan
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Kelola daftar invoice studio Anda dan sinkronkan pembukuan ke Google Sheets.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Sheets Quick Link, Sync All, New Invoice */}
        <div className="p-4 border-b border-neutral-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari no. invoice, nama klien, atau perusahaan..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {sheetsConfig && (
              <a
                href={sheetsConfig.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Spreadsheet di Google Sheets"
                className="px-3 py-2 rounded-xl border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden md:inline">Buka Sheets</span>
                <ArrowUpRight className="w-3 h-3 text-emerald-700" />
              </a>
            )}

            <button
              type="button"
              onClick={onSyncAllToSheets}
              disabled={isSyncingSheets || savedInvoices.length === 0}
              className="px-3 py-2 rounded-xl border border-neutral-950 bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin text-neutral-950' : 'text-neutral-700'}`} />
              <span>{isSyncingSheets ? 'Menyinkronkan...' : 'Sinkron Semua ke Sheets'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onCreateNewInvoice();
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#FFD400]" />
              <span>Buat Baru</span>
            </button>
          </div>
        </div>

        {/* Invoice List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-neutral-100/50">
          {filteredInvoices.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-neutral-200 text-neutral-500 flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">
                {searchQuery ? 'Tidak ada invoice yang sesuai pencarian' : 'Belum ada data invoice tersimpan'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto mb-4">
                {searchQuery
                  ? `Kata kunci "${searchQuery}" tidak ditemukan pada daftar riwayat.`
                  : 'Klik tombol "Simpan Data Invoice" pada bar atas untuk menyimpan invoice yang sedang Anda kerjakan saat ini.'}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onCreateNewInvoice();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#FFD400] text-neutral-950 text-xs font-extrabold shadow-xs hover:bg-[#E6BE00] transition cursor-pointer"
                >
                  Buat Invoice Baru
                </button>
              )}
            </div>
          ) : (
            filteredInvoices.map((inv) => {
              const isActive = inv.invoiceNumber.trim() === currentInvoiceNumber.trim();
              const isDeleting = confirmDeleteId === inv.id;
              const isSingleSyncing = syncingSingleInvNo === inv.invoiceNumber;

              return (
                <div
                  key={inv.id}
                  className={`bg-white rounded-xl border p-4 sm:p-4.5 transition-all shadow-2xs hover:shadow-sm ${
                    isActive
                      ? 'border-2 border-neutral-950 ring-2 ring-[#FFD400]/40'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Invoice Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-xs sm:text-sm text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                          {inv.invoiceNumber}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#FFD400] text-neutral-950 border border-neutral-900">
                            Sedang Dibuka
                          </span>
                        )}
                        {renderStatusBadge(inv)}
                        {inv.syncedToSheetsAt ? (
                          <span
                            title={`Tersinkron ke Google Sheets pada: ${new Date(inv.syncedToSheetsAt).toLocaleString('id-ID')}`}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Sheets ✓
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-400 italic">Belum disinkron</span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2">
                        <h4 className="font-bold text-sm text-neutral-900 truncate">{inv.clientName}</h4>
                        {inv.clientCompany && (
                          <span className="text-xs text-neutral-500 truncate">• {inv.clientCompany}</span>
                        )}
                      </div>

                      {inv.projectSummary && (
                        <p className="text-[11px] text-neutral-600 line-clamp-1">{inv.projectSummary}</p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          Tgl: {formatDateIndo(inv.invoiceDate)}
                        </span>
                        <span>•</span>
                        <span>Jatuh Tempo: {formatDateIndo(inv.dueDate)}</span>
                        <span>•</span>
                        <span className="text-neutral-400 text-[10px]">
                          Update: {new Date(inv.updatedAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Financial Summary & Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-neutral-100 pt-3 md:pt-0 gap-3">
                      <div className="text-left md:text-right">
                        <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                          Total Tagihan
                        </div>
                        <div className="font-mono font-black text-sm sm:text-base text-neutral-950">
                          {formatRupiah(inv.grandTotal)}
                        </div>
                        {inv.paymentScheme !== 'full' && (
                          <div className="text-[10px] font-semibold text-neutral-600">
                            Sisa: <span className="font-mono font-bold">{formatRupiah(inv.remainingAmount)}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        {isDeleting ? (
                          <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200 animate-in fade-in">
                            <span className="text-[10px] font-bold text-red-700 px-1">Yakin hapus?</span>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteInvoice(inv.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded hover:bg-red-700 cursor-pointer"
                            >
                              Ya
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 bg-neutral-200 text-neutral-700 text-[10px] font-bold rounded hover:bg-neutral-300 cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSyncSingle(inv.data)}
                              disabled={isSingleSyncing || isSyncingSheets}
                              title="Simpan / Sinkronkan invoice ini ke Google Sheets"
                              className="p-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs transition cursor-pointer"
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 ${isSingleSyncing ? 'animate-spin text-emerald-600' : ''}`}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDuplicateInvoice(inv.data)}
                              title="Duplikasi invoice ini untuk klien/proyek baru"
                              className="p-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs transition cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(inv.id)}
                              title="Hapus invoice dari riwayat"
                              className="p-1.5 rounded-lg border border-neutral-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 text-neutral-400 text-xs transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onLoadInvoice(inv.data);
                                onClose();
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                isActive
                                  ? 'bg-neutral-950 text-white hover:bg-neutral-800'
                                  : 'bg-[#FFD400] text-neutral-950 hover:bg-[#E6BE00]'
                              }`}
                            >
                              <span>{isActive ? 'Buka Editor' : 'Muat Invoice'}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>
              Invoice tersimpan aman di browser Anda dan dapat dicadangkan langsung ke Google Sheets.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 font-bold transition cursor-pointer w-full sm:w-auto"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
