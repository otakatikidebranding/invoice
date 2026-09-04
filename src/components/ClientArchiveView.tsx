import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Phone,
  Mail,
  Building,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  MessageSquare,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wallet,
  Coins,
  Receipt,
  FolderOpen,
} from 'lucide-react';
import { SavedInvoice, InvoiceData, PaymentStatus } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface ClientRecord {
  key: string;
  name: string;
  company?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  invoices: SavedInvoice[];
  totalProjectsCount: number;
  totalGrandTotal: number;
  totalRemaining: number;
  totalPaidEstimated: number;
  hasUnpaid: boolean;
  hasPartialPaid: boolean;
  allPaid: boolean;
  latestDate: string;
}

interface ClientArchiveViewProps {
  savedInvoices: SavedInvoice[];
  onLoadInvoice: (invoice: InvoiceData) => void;
  onCreateInvoiceForClient: (clientInfo: {
    name: string;
    company?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
  }) => void;
  onOpenWhatsApp: (invoice: InvoiceData) => void;
  onBackToBuilder: () => void;
}

export const ClientArchiveView: React.FC<ClientArchiveViewProps> = ({
  savedInvoices,
  onLoadInvoice,
  onCreateInvoiceForClient,
  onOpenWhatsApp,
  onBackToBuilder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'remaining' | 'total' | 'name'>('remaining');
  const [expandedClientKey, setExpandedClientKey] = useState<string | null>(null);

  // Group invoices by client
  const clientsData = useMemo(() => {
    const map = new Map<string, ClientRecord>();

    savedInvoices.forEach((inv) => {
      const clientName = (inv.clientName || 'Tanpa Nama').trim();
      const company = (inv.clientCompany || '').trim();
      // Grouping key by lowercase name + optional company
      const key = `${clientName.toLowerCase()}___${company.toLowerCase()}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          name: clientName,
          company: inv.clientCompany || undefined,
          whatsapp: inv.data.client.whatsapp || undefined,
          email: inv.data.client.email || undefined,
          address: inv.data.client.address || undefined,
          invoices: [],
          totalProjectsCount: 0,
          totalGrandTotal: 0,
          totalRemaining: 0,
          totalPaidEstimated: 0,
          hasUnpaid: false,
          hasPartialPaid: false,
          allPaid: true,
          latestDate: inv.invoiceDate,
        });
      }

      const rec = map.get(key)!;
      rec.invoices.push(inv);
      rec.totalProjectsCount += 1;
      rec.totalGrandTotal += inv.grandTotal;
      rec.totalRemaining += inv.remainingAmount;

      const estimatedPaid = Math.max(0, inv.grandTotal - inv.remainingAmount);
      rec.totalPaidEstimated += estimatedPaid;

      if (inv.paymentStatus !== 'paid' && inv.remainingAmount > 0) {
        rec.hasUnpaid = true;
        rec.allPaid = false;
      }
      if (inv.paymentStatus === 'dp_paid') {
        rec.hasPartialPaid = true;
        rec.allPaid = false;
      }

      // Update latest contact info if missing
      if (!rec.whatsapp && inv.data.client.whatsapp) rec.whatsapp = inv.data.client.whatsapp;
      if (!rec.email && inv.data.client.email) rec.email = inv.data.client.email;
      if (!rec.address && inv.data.client.address) rec.address = inv.data.client.address;

      if (inv.invoiceDate > rec.latestDate) {
        rec.latestDate = inv.invoiceDate;
      }
    });

    const list = Array.from(map.values());

    // Sort invoices inside each client record by date desc
    list.forEach((c) => {
      c.invoices.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
    });

    return list;
  }, [savedInvoices]);

  // Filter & Sort clients
  const filteredClients = useMemo(() => {
    let result = clientsData;

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          (c.whatsapp && c.whatsapp.includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          c.invoices.some((inv) => inv.invoiceNumber.toLowerCase().includes(q))
      );
    }

    // Filter by status
    if (statusFilter === 'unpaid') {
      result = result.filter((c) => c.hasUnpaid || c.totalRemaining > 0);
    } else if (statusFilter === 'paid') {
      result = result.filter((c) => c.allPaid && c.totalRemaining === 0);
    }

    // Sort
    return [...result].sort((a, b) => {
      if (sortBy === 'remaining') {
        return b.totalRemaining - a.totalRemaining;
      }
      if (sortBy === 'total') {
        return b.totalGrandTotal - a.totalGrandTotal;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // date
      return new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime();
    });
  }, [clientsData, searchQuery, statusFilter, sortBy]);

  // Overall statistics
  const stats = useMemo(() => {
    let totalAllProjects = 0;
    let totalAllRemaining = 0;
    let totalAllPaid = 0;
    let unpaidClientsCount = 0;

    clientsData.forEach((c) => {
      totalAllProjects += c.totalGrandTotal;
      totalAllRemaining += c.totalRemaining;
      totalAllPaid += c.totalPaidEstimated;
      if (c.hasUnpaid || c.totalRemaining > 0) unpaidClientsCount += 1;
    });

    return {
      totalClients: clientsData.length,
      unpaidClientsCount,
      totalAllProjects,
      totalAllRemaining,
      totalAllPaid,
    };
  }, [clientsData]);

  const toggleExpand = (key: string) => {
    setExpandedClientKey((prev) => (prev === key ? null : key));
  };

  const renderPaymentStatusBadge = (status: PaymentStatus, remaining: number) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Lunas 100%
          </span>
        );
      case 'dp_paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-[#FFD400] border border-neutral-900">
            <Clock className="w-3 h-3 text-[#FFD400]" />
            DP Diterima (Sisa {formatRupiah(remaining)})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-900" />
            Belum Bayar ({formatRupiah(remaining)})
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                <Users className="w-4 h-4 text-[#FFD400]" />
              </div>
              <h1 className="text-xl font-display font-extrabold text-neutral-950 tracking-tight">
                Kumpulan Data Klien & Status Invoice
              </h1>
            </div>
            <p className="text-xs text-neutral-500">
              Direktori seluruh klien studio otakatikide, rekap omset proyek, serta pemantauan status sisa pelunasan tagihan.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToBuilder}
              className="px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <FileText className="w-4 h-4 text-neutral-700" />
              <span>Kembali ke Editor Invoice</span>
            </button>
          </div>
        </div>

        {/* Financial Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5 pt-5 border-t border-neutral-100">
          <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-200/80">
            <div className="flex items-center justify-between text-neutral-500 text-[11px] font-semibold mb-1">
              <span>Total Klien Terdaftar</span>
              <Users className="w-3.5 h-3.5 text-neutral-400" />
            </div>
            <div className="text-lg sm:text-xl font-black font-display text-neutral-950">
              {stats.totalClients}{' '}
              <span className="text-xs font-medium text-neutral-500 font-sans">Klien</span>
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              Dari total {savedInvoices.length} arsip invoice
            </div>
          </div>

          <div className="bg-amber-50/70 rounded-xl p-3.5 border border-amber-200">
            <div className="flex items-center justify-between text-amber-900 text-[11px] font-bold mb-1">
              <span>Total Sisa Tagihan (Outstanding)</span>
              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-amber-950">
              {formatRupiah(stats.totalAllRemaining)}
            </div>
            <div className="text-[10px] font-semibold text-amber-800 mt-0.5">
              {stats.unpaidClientsCount} klien perlu pelunasan
            </div>
          </div>

          <div className="bg-emerald-50/70 rounded-xl p-3.5 border border-emerald-200">
            <div className="flex items-center justify-between text-emerald-900 text-[11px] font-bold mb-1">
              <span>Estimasi Pembayaran Diterima</span>
              <Wallet className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-950">
              {formatRupiah(stats.totalAllPaid)}
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Sudah masuk kas/rekening</div>
          </div>

          <div className="bg-neutral-950 text-white rounded-xl p-3.5 border border-neutral-900 shadow-xs">
            <div className="flex items-center justify-between text-neutral-400 text-[11px] font-semibold mb-1">
              <span>Total Nilai Keseluruhan Proyek</span>
              <Coins className="w-3.5 h-3.5 text-[#FFD400]" />
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-[#FFD400]">
              {formatRupiah(stats.totalAllProjects)}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Akumulasi seluruh transaksi</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama klien, nama perusahaan, kontak WA, atau nomor invoice..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-neutral-950 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Semua ({clientsData.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('unpaid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'unpaid'
                  ? 'bg-amber-400 text-neutral-950 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>Ada Tagihan ({stats.unpaidClientsCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'paid'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Lunas ({clientsData.length - stats.unpaidClientsCount})</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 text-xs text-neutral-500 bg-neutral-50 px-2.5 py-1.5 rounded-xl border border-neutral-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-neutral-800 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="remaining">Sisa Tagihan Tertinggi</option>
              <option value="total">Nilai Proyek Tertinggi</option>
              <option value="date">Invoice Terbaru</option>
              <option value="name">Nama Klien (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Cards Grid / List */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-2xs">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 mb-1">
            {searchQuery ? 'Klien tidak ditemukan' : 'Belum ada arsip data klien'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mb-5">
            {searchQuery
              ? `Tidak ada data klien yang cocok dengan kata kunci "${searchQuery}". Coba ubah kata kunci pencarian Anda.`
              : 'Setiap invoice yang Anda simpan akan otomatis diarsipkan dan dirangkum ke dalam direktori klien ini.'}
          </p>
          <button
            type="button"
            onClick={onBackToBuilder}
            className="px-4 py-2 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition cursor-pointer shadow-xs"
          >
            Buka Editor & Buat Invoice Baru
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredClients.map((client) => {
            const isExpanded = expandedClientKey === client.key;
            const hasRemaining = client.totalRemaining > 0;

            return (
              <div
                key={client.key}
                className={`bg-white rounded-2xl border transition-all duration-150 overflow-hidden shadow-2xs ${
                  hasRemaining
                    ? 'border-neutral-300 hover:border-amber-400'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {/* Client Main Summary Row */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Client Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-display font-extrabold text-base text-neutral-950 tracking-tight">
                        {client.name}
                      </span>
                      {client.company && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded-md border border-neutral-200">
                          <Building className="w-3 h-3 text-neutral-500" />
                          {client.company}
                        </span>
                      )}
                      {hasRemaining ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                          Perlu Pelunasan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          Semua Lunas
                        </span>
                      )}
                    </div>

                    {/* Contacts & Metadata */}
                    <div className="flex items-center gap-3 text-xs text-neutral-500 flex-wrap pt-0.5">
                      {client.whatsapp && (
                        <span className="flex items-center gap-1 text-neutral-700 font-medium">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          {client.whatsapp}
                        </span>
                      )}
                      {client.email && (
                        <span className="flex items-center gap-1 text-neutral-700 font-medium">
                          <Mail className="w-3 h-3 text-neutral-400" />
                          {client.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-neutral-400 text-[11px]">
                        <Receipt className="w-3 h-3" />
                        {client.totalProjectsCount} Invoice
                      </span>
                      <span className="text-neutral-400 text-[11px]">
                        Terakhir: {formatDateIndo(client.latestDate)}
                      </span>
                    </div>
                  </div>

                  {/* Center/Right: Financial Balance & Quick Actions */}
                  <div className="flex flex-row sm:flex-row items-center justify-between lg:justify-end gap-3 sm:gap-6 border-t lg:border-t-0 border-neutral-100 pt-3 lg:pt-0">
                    {/* Financial Figures */}
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-neutral-400">Total Proyek</div>
                        <div className="text-xs sm:text-sm font-mono font-black text-neutral-900">
                          {formatRupiah(client.totalGrandTotal)}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase font-bold text-neutral-400">Sisa Tagihan</div>
                        <div
                          className={`text-xs sm:text-sm font-mono font-black ${
                            hasRemaining ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {formatRupiah(client.totalRemaining)}
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-1.5">
                      {client.whatsapp && (
                        <button
                          type="button"
                          onClick={() => {
                            // Open WhatsApp for the latest invoice of this client
                            if (client.invoices.length > 0) {
                              onOpenWhatsApp(client.invoices[0].data);
                            }
                          }}
                          title="Kirim pesan WhatsApp atau reminder tagihan ke klien ini"
                          className="px-2.5 py-1.5 rounded-xl border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          onCreateInvoiceForClient({
                            name: client.name,
                            company: client.company,
                            whatsapp: client.whatsapp,
                            email: client.email,
                            address: client.address,
                          })
                        }
                        title="Buat invoice baru untuk klien ini dengan data kontak otomatis terisi"
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#FFD400]" />
                        <span className="hidden sm:inline">Buat Invoice</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExpand(client.key)}
                        className="p-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition cursor-pointer"
                        title={isExpanded ? 'Tutup daftar invoice' : 'Lihat semua invoice klien'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Section: List of Invoices for this client */}
                {isExpanded && (
                  <div className="bg-neutral-50/80 border-t border-neutral-200 p-4 sm:p-5 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-600 mb-2">
                      <span className="flex items-center gap-1.5">
                        <FolderOpen className="w-3.5 h-3.5 text-neutral-500" />
                        Daftar Invoice Proyek ({client.invoices.length})
                      </span>
                      <span className="text-[11px] text-neutral-400 font-normal">
                        Klik tombol "Buka Invoice" untuk melihat atau mengedit
                      </span>
                    </div>

                    <div className="space-y-2">
                      {client.invoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="bg-white rounded-xl border border-neutral-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-neutral-300 transition"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-black text-xs text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                                {inv.invoiceNumber}
                              </span>
                              {renderPaymentStatusBadge(inv.paymentStatus, inv.remainingAmount)}
                              {inv.syncedToSheetsAt && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  Sheets ✓
                                </span>
                              )}
                            </div>

                            {inv.projectSummary && (
                              <p className="text-xs text-neutral-700 font-medium line-clamp-1">
                                {inv.projectSummary}
                              </p>
                            )}

                            <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                              <span>Tgl: {formatDateIndo(inv.invoiceDate)}</span>
                              <span>•</span>
                              <span>Jatuh Tempo: {formatDateIndo(inv.dueDate)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-neutral-100 pt-2 sm:pt-0">
                            <div className="text-left sm:text-right">
                              <div className="text-[10px] uppercase font-bold text-neutral-400">Total Tagihan</div>
                              <div className="font-mono font-black text-xs sm:text-sm text-neutral-950">
                                {formatRupiah(inv.grandTotal)}
                              </div>
                              {inv.paymentScheme !== 'full' && (
                                <div className="text-[10px] text-neutral-500 font-semibold">
                                  Sisa: {formatRupiah(inv.remainingAmount)}
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => onLoadInvoice(inv.data)}
                              className="px-3 py-1.5 rounded-lg bg-[#FFD400] hover:bg-[#E6BE00] text-neutral-950 text-xs font-black transition cursor-pointer shadow-2xs flex items-center gap-1"
                            >
                              <span>Buka</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
