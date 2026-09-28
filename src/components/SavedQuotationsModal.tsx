import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Receipt,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  X,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { SavedQuotation, QuotationData, QuotationStatus } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface SavedQuotationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedQuotations: SavedQuotation[];
  currentQuotationNumber: string;
  onLoadQuotation: (quo: QuotationData) => void;
  onDeleteQuotation: (id: string) => void;
  onCreateNewQuotation: () => void;
  onConvertToInvoice: (quo: QuotationData) => void;
}

export const SavedQuotationsModal: React.FC<SavedQuotationsModalProps> = ({
  isOpen,
  onClose,
  savedQuotations,
  currentQuotationNumber,
  onLoadQuotation,
  onDeleteQuotation,
  onCreateNewQuotation,
  onConvertToInvoice,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = savedQuotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (q.clientCompany && q.clientCompany.toLowerCase().includes(search.toLowerCase())) ||
      (q.subject && q.subject.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-400">
            <CheckCircle2 className="w-3 h-3 text-amber-700" />
            Disetujui (Deal)
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-300">
            <Send className="w-3 h-3 text-blue-700" />
            Terkirim
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 border border-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-700" />
            Ditolak
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-700">
            <Clock className="w-3 h-3" />
            Kedaluwarsa
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-300">
            Draf
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-950 text-[#FFD400] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-neutral-950 font-display">
                Riwayat Surat Penawaran ({savedQuotations.length})
              </h3>
              <p className="text-xs text-neutral-500">
                Daftar proposal harga yang pernah dibuat untuk klien baru.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onCreateNewQuotation();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#FFD400]" />
              <span>+ Buat Penawaran</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-950 p-1 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama klien, nomor SPH, atau perihal..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950"
            />
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('accepted')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filterStatus === 'accepted'
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Deal
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('sent')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filterStatus === 'sent'
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Terkirim
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('draft')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filterStatus === 'draft'
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Draf
            </button>
          </div>
        </div>

        {/* Quotation List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-neutral-300" />
              <p className="text-xs text-neutral-500 font-medium">
                Belum ada surat penawaran yang cocok dengan pencarian.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const isCurrent =
                item.quotationNumber.trim().toLowerCase() ===
                currentQuotationNumber.trim().toLowerCase();

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'border-neutral-950 bg-neutral-50/80 shadow-xs ring-1 ring-neutral-950'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-neutral-950">
                        {item.quotationNumber}
                      </span>
                      {getStatusBadge(item.status)}
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-neutral-600 bg-neutral-200/80 px-2 py-0.2 rounded">
                          Sedang Dibuka
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-neutral-900 leading-tight">
                        {item.clientName || 'Tanpa Nama Klien'}
                      </h4>
                      {item.clientCompany && (
                        <span className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-neutral-400" />
                          <span>{item.clientCompany}</span>
                        </span>
                      )}
                    </div>

                    {item.subject && (
                      <p className="text-xs text-neutral-600 line-clamp-1 italic">
                        {item.subject}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-0.5">
                      <span>Tanggal: {formatDateIndo(item.quotationDate)}</span>
                      <span>•</span>
                      <span>Total: <strong className="text-neutral-950 font-mono">{formatRupiah(item.grandTotal)}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onConvertToInvoice(item.data);
                        onClose();
                      }}
                      title="Konversi langsung penawaran ini ke Invoice"
                      className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-neutral-950 text-xs font-black flex items-center gap-1 transition cursor-pointer shadow-2xs border border-amber-500"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Ke Invoice</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadQuotation(item.data);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                    >
                      Buka
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus surat penawaran ${item.quotationNumber}?`)) {
                          onDeleteQuotation(item.id);
                        }
                      }}
                      title="Hapus penawaran"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
