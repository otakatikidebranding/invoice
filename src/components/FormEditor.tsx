import React, { useState } from 'react';
import {
  Building,
  User,
  ListPlus,
  Trash2,
  Sparkles,
  Percent,
  CreditCard,
  FileText,
  Plus,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { InvoiceData, LineItem, PaymentScheme, PaymentStatus } from '../types';
import { PRESET_SERVICES, ServicePreset } from '../utils/presets';
import { calculateInvoice, formatRupiah } from '../utils/formatters';

interface FormEditorProps {
  invoice: InvoiceData;
  onChange: (updated: InvoiceData) => void;
}

export const FormEditor: React.FC<FormEditorProps> = ({ invoice, onChange }) => {
  const [activeTab, setActiveTab] = useState<'client' | 'items' | 'payment' | 'studio' | 'terms'>('items');
  const [showPresetsModal, setShowPresetsModal] = useState(false);

  const calc = calculateInvoice(invoice);

  // Line Item Handlers
  const handleAddItem = (preset?: ServicePreset) => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: preset ? preset.title : 'Layanan Desain Baru',
      details: preset ? preset.description : '',
      qty: 1,
      price: preset ? preset.price : 1000000,
    };
    onChange({
      ...invoice,
      items: [...invoice.items, newItem],
    });
  };

  const handleUpdateItem = (id: string, field: keyof LineItem, value: string | number) => {
    onChange({
      ...invoice,
      items: invoice.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    });
  };

  const handleDeleteItem = (id: string) => {
    if (invoice.items.length <= 1) {
      alert('Invoice harus memiliki minimal 1 baris item.');
      return;
    }
    onChange({
      ...invoice,
      items: invoice.items.filter((item) => item.id !== id),
    });
  };

  // Auto Generate Invoice Number
  const handleAutoGenerateInvoiceNum = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newNum = `INV/OAI/${year}/${month}/${randomNum}`;
    onChange({
      ...invoice,
      invoiceNumber: newNum,
    });
  };

  // Handle QRIS Image Upload
  const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({
          ...invoice,
          paymentDetails: {
            ...invoice.paymentDetails,
            qrisImageUrl: reader.result as string,
            showQris: true,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Term Handlers
  const handleAddTerm = () => {
    onChange({
      ...invoice,
      terms: [...invoice.terms, 'Syarat & ketentuan baru...'],
    });
  };

  const handleUpdateTerm = (index: number, val: string) => {
    const updated = [...invoice.terms];
    updated[index] = val;
    onChange({
      ...invoice,
      terms: updated,
    });
  };

  const handleDeleteTerm = (index: number) => {
    onChange({
      ...invoice,
      terms: invoice.terms.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden no-print">
      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-200 bg-neutral-50/70 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition cursor-pointer border-b-2 ${
            activeTab === 'items'
              ? 'border-neutral-950 text-neutral-950 bg-white'
              : 'border-transparent text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
          }`}
        >
          <ListPlus className={`w-4 h-4 ${activeTab === 'items' ? 'text-neutral-950' : 'text-neutral-500'}`} />
          <span>Rincian Layanan ({invoice.items.length})</span>
          {activeTab === 'items' && <span className="w-1.5 h-1.5 rounded-full bg-[#FFD400]"></span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('client')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition cursor-pointer border-b-2 ${
            activeTab === 'client'
              ? 'border-neutral-950 text-neutral-950 bg-white'
              : 'border-transparent text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
          }`}
        >
          <User className={`w-4 h-4 ${activeTab === 'client' ? 'text-neutral-950' : 'text-neutral-500'}`} />
          <span>Data Klien & WA</span>
          {activeTab === 'client' && <span className="w-1.5 h-1.5 rounded-full bg-[#FFD400]"></span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payment')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition cursor-pointer border-b-2 ${
            activeTab === 'payment'
              ? 'border-neutral-950 text-neutral-950 bg-white'
              : 'border-transparent text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
          }`}
        >
          <CreditCard className={`w-4 h-4 ${activeTab === 'payment' ? 'text-neutral-950' : 'text-neutral-500'}`} />
          <span>Skema DP & Rekening</span>
          {activeTab === 'payment' && <span className="w-1.5 h-1.5 rounded-full bg-[#FFD400]"></span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('terms')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition cursor-pointer border-b-2 ${
            activeTab === 'terms'
              ? 'border-neutral-950 text-neutral-950 bg-white'
              : 'border-transparent text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeTab === 'terms' ? 'text-neutral-950' : 'text-neutral-500'}`} />
          <span>Catatan & Ketentuan</span>
          {activeTab === 'terms' && <span className="w-1.5 h-1.5 rounded-full bg-[#FFD400]"></span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('studio')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition cursor-pointer border-b-2 ${
            activeTab === 'studio'
              ? 'border-neutral-950 text-neutral-950 bg-white'
              : 'border-transparent text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
          }`}
        >
          <Building className={`w-4 h-4 ${activeTab === 'studio' ? 'text-neutral-950' : 'text-neutral-500'}`} />
          <span>Profil Studio</span>
          {activeTab === 'studio' && <span className="w-1.5 h-1.5 rounded-full bg-[#FFD400]"></span>}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Document Header Info (Invoice Number & Dates) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200/80">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                Nomor Invoice
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateInvoiceNum}
                className="text-[10px] text-neutral-800 hover:text-black flex items-center gap-1 font-bold cursor-pointer"
                title="Generate Nomor Baru"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Auto-gen
              </button>
            </div>
            <input
              type="text"
              value={invoice.invoiceNumber}
              onChange={(e) => onChange({ ...invoice, invoiceNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-hidden"
              placeholder="INV/OAI/2026/001"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Tanggal Invoice
            </label>
            <input
              type="date"
              value={invoice.invoiceDate}
              onChange={(e) => onChange({ ...invoice, invoiceDate: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Tanggal Jatuh Tempo (Due Date)
            </label>
            <input
              type="date"
              value={invoice.dueDate}
              onChange={(e) => onChange({ ...invoice, dueDate: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-hidden font-bold text-neutral-950"
            />
          </div>
        </div>

        {/* TAB 1: LINE ITEMS */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-neutral-950 text-sm">Rincian Layanan & Proyek</h3>
                <p className="text-xs text-neutral-500">
                  Daftar layanan branding, kuantitas, serta harga satuan pekerjaan.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPresetsModal(!showPresetsModal)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#FFD400] text-neutral-950 border border-[#E6BE00] hover:bg-[#E6BE00] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
                  <span>Preset Katalog Layanan</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem()}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 flex items-center gap-1.5 transition cursor-pointer shadow-xs border border-neutral-800"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FFD400]" />
                  <span>Tambah Item</span>
                </button>
              </div>
            </div>

            {/* Presets Quick Drawer */}
            {showPresetsModal && (
              <div className="p-4 bg-neutral-100 rounded-xl border border-neutral-300 space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-black text-neutral-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
                    Pilih Layanan Standar Studio otakatikide:
                  </span>
                  <button
                    onClick={() => setShowPresetsModal(false)}
                    className="text-[11px] text-neutral-700 hover:text-black font-bold"
                  >
                    Tutup
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {PRESET_SERVICES.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        handleAddItem(preset);
                        setShowPresetsModal(false);
                      }}
                      className="p-3 bg-white rounded-lg border border-neutral-200 hover:border-neutral-950 hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-neutral-950">{preset.title}</h4>
                          <span className="text-[11px] font-mono font-black text-neutral-950 bg-[#FFD400]/20 px-1.5 py-0.5 rounded border border-[#FFD400]/60 whitespace-nowrap">
                            {formatRupiah(preset.price)}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 mt-1 line-clamp-2">
                          {preset.description}
                        </p>
                      </div>
                      <span className="text-[10px] text-neutral-950 font-bold mt-2 flex items-center gap-1">
                        + Tambahkan ke Invoice
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Item Rows */}
            <div className="space-y-3">
              {invoice.items.map((item, index) => {
                const totalItem = (Number(item.qty) || 0) * (Number(item.price) || 0);
                return (
                  <div
                    key={item.id || index}
                    className="p-4 bg-neutral-50/90 rounded-xl border border-neutral-200/90 space-y-3 transition hover:border-neutral-400"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-neutral-950 text-white text-xs font-mono font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-neutral-900">
                          Item #{index + 1}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-neutral-400 hover:text-rose-600 transition cursor-pointer"
                        title="Hapus baris item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-6 space-y-1">
                        <label className="text-[11px] font-semibold text-neutral-600">
                          Nama Layanan / Pekerjaan
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'description', e.target.value)
                          }
                          placeholder="misal: Brand Identity & Logo System"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-hidden font-medium"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[11px] font-semibold text-neutral-600">
                          Kuantitas (Qty)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'qty', parseInt(e.target.value, 10) || 1)
                          }
                          className="w-full px-3 py-2 text-xs text-center font-mono rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-hidden font-bold"
                        />
                      </div>

                      <div className="md:col-span-4 space-y-1">
                        <label className="text-[11px] font-semibold text-neutral-600">
                          Harga Satuan (IDR)
                        </label>
                        <input
                          type="number"
                          step="50000"
                          value={item.price}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-3 py-2 text-xs text-right font-mono font-bold rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-600">
                        Detail Spesifikasi / Deliverables (Opsional)
                      </label>
                      <input
                        type="text"
                        value={item.details || ''}
                        onChange={(e) => handleUpdateItem(item.id, 'details', e.target.value)}
                        placeholder="Contoh: 3 Konsep Logo, Vector Files (AI, SVG), PDF Guidelines..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-hidden text-neutral-700"
                      />
                    </div>

                    <div className="flex justify-end pt-1 text-xs text-neutral-600">
                      <span>Total Item: </span>
                      <span className="font-mono font-black text-neutral-950 ml-1">
                        {formatRupiah(totalItem)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick calculations footer */}
            <div className="p-4 bg-neutral-950 text-white rounded-xl flex flex-wrap items-center justify-between gap-4 border border-neutral-900">
              <div className="text-xs">
                <span className="text-neutral-400">Total Item Subtotal:</span>
                <p className="text-lg font-mono font-black text-[#FFD400]">
                  {formatRupiah(calc.subtotal)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('payment')}
                  className="px-4 py-2 bg-[#FFD400] hover:bg-[#E6BE00] active:bg-[#CCAA00] text-neutral-950 text-xs font-black rounded-lg transition flex items-center gap-2 cursor-pointer shadow-xs border border-[#E6BE00]"
                >
                  <span>Atur Skema DP & Diskon →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLIENT INFO */}
        {activeTab === 'client' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-neutral-950 text-sm">Informasi Klien</h3>
              <p className="text-xs text-neutral-500">
                Data klien tujuan penagihan invoice & nomor WhatsApp untuk notifikasi otomatis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Nama Klien (Person in Charge)
                </label>
                <input
                  type="text"
                  value={invoice.client.name}
                  onChange={(e) =>
                    onChange({
                      ...invoice,
                      client: { ...invoice.client, name: e.target.value },
                    })
                  }
                  placeholder="Contoh: Bpk. Hendra Pratama"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Nama Perusahaan / Bisnis
                </label>
                <input
                  type="text"
                  value={invoice.client.company}
                  onChange={(e) =>
                    onChange({
                      ...invoice,
                      client: { ...invoice.client, company: e.target.value },
                    })
                  }
                  placeholder="Contoh: Nusantara Coffee Roastery"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 flex items-center justify-between">
                  <span>Nomor WhatsApp Klien</span>
                  <span className="text-[10px] text-emerald-700 font-mono">Format: 628...</span>
                </label>
                <input
                  type="text"
                  value={invoice.client.whatsapp}
                  onChange={(e) =>
                    onChange({
                      ...invoice,
                      client: { ...invoice.client, whatsapp: e.target.value },
                    })
                  }
                  placeholder="628123456789 atau 08123456789"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-hidden font-mono"
                />
                <p className="text-[10px] text-neutral-500">
                  Nomor ini digunakan saat Anda menekan tombol "Kirim ke WA".
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Email Klien
                </label>
                <input
                  type="email"
                  value={invoice.client.email}
                  onChange={(e) =>
                    onChange({
                      ...invoice,
                      client: { ...invoice.client, email: e.target.value },
                    })
                  }
                  placeholder="klien@domain.com"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                Alamat Klien / Lokasi Proyek
              </label>
              <textarea
                rows={2}
                value={invoice.client.address}
                onChange={(e) =>
                  onChange({
                    ...invoice,
                    client: { ...invoice.client, address: e.target.value },
                  })
                }
                placeholder="Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-hidden"
              />
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT SCHEME & DISCOUNTS */}
        {activeTab === 'payment' && (
          <div className="space-y-5">
            <div>
              <h3 className="font-bold text-neutral-950 text-sm">
                Skema Pembayaran, Diskon & Rekening
              </h3>
              <p className="text-xs text-neutral-500">
                Konfigurasi sistem DP 50%, pelunasan, diskon khusus, dan info rekening Bank BCA / QRIS.
              </p>
            </div>

            {/* Scheme Selector */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                Pilihan Skema Pembayaran
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => onChange({ ...invoice, paymentScheme: 'dp_50' })}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    invoice.paymentScheme === 'dp_50'
                      ? 'border-neutral-950 bg-[#FFD400]/10 shadow-2xs'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="pt-0.5">
                    <input
                      type="radio"
                      name="paymentScheme"
                      checked={invoice.paymentScheme === 'dp_50'}
                      onChange={() => {}}
                      className="accent-neutral-950 w-4 h-4 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-neutral-950">Sistem DP 50% & Pelunasan</h4>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-[#FFD400] text-neutral-950">DP 50%</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug">
                      Menampilkan nominal DP 50% di awal ({formatRupiah(calc.dpAmount)}) dan sisa pelunasan 50% di akhir.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => onChange({ ...invoice, paymentScheme: 'full' })}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    invoice.paymentScheme === 'full'
                      ? 'border-neutral-950 bg-neutral-100 shadow-2xs'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="pt-0.5">
                    <input
                      type="radio"
                      name="paymentScheme"
                      checked={invoice.paymentScheme === 'full'}
                      onChange={() => {}}
                      className="accent-neutral-950 w-4 h-4 cursor-pointer"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-950">Pelunasan Penuh (100%)</h4>
                    <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug">
                      Menagih seluruh total pembayaran 100% ({formatRupiah(calc.grandTotal)}).
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="pt-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">
                  Status Pembayaran Saat Ini
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'draft', label: 'Draft / Belum Bayar' },
                    { id: 'dp_paid', label: 'DP 50% Lunas' },
                    { id: 'paid', label: 'Lunas Penuh (Paid)' },
                  ].map((status) => {
                    const isSelected = invoice.paymentStatus === status.id;
                    let activeClass = 'bg-neutral-950 text-white border-neutral-950 shadow-xs';
                    if (status.id === 'paid' && isSelected) {
                      activeClass = 'bg-[#FFD400] text-neutral-950 border-[#E6BE00] font-black shadow-xs';
                    } else if (status.id === 'dp_paid' && isSelected) {
                      activeClass = 'bg-neutral-950 text-[#FFD400] border-neutral-950 font-bold shadow-xs';
                    }

                    return (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() => onChange({ ...invoice, paymentStatus: status.id as PaymentStatus })}
                        className={`px-3 py-2 text-xs font-bold rounded-lg border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? activeClass
                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle2 className={`w-3.5 h-3.5 ${status.id === 'paid' ? 'text-neutral-950' : 'text-[#FFD400]'}`} />
                        )}
                        <span>{status.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Discount & Tax Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Discount Box */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-neutral-950" />
                    Opsi Diskon / Promo
                  </label>
                  <input
                    type="checkbox"
                    checked={invoice.discount.enabled}
                    onChange={(e) =>
                      onChange({
                        ...invoice,
                        discount: { ...invoice.discount, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded accent-neutral-950 cursor-pointer"
                  />
                </div>

                {invoice.discount.enabled && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <select
                        value={invoice.discount.type}
                        onChange={(e) =>
                          onChange({
                            ...invoice,
                            discount: {
                              ...invoice.discount,
                              type: e.target.value as 'percentage' | 'fixed',
                            },
                          })
                        }
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white outline-hidden font-medium"
                      >
                        <option value="percentage">Persen (%)</option>
                        <option value="fixed">Nominal Tetap (Rp)</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={invoice.discount.value}
                        onChange={(e) =>
                          onChange({
                            ...invoice,
                            discount: {
                              ...invoice.discount,
                              value: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        placeholder="Nilai diskon"
                        className="w-full px-2 py-1.5 text-xs text-right font-mono rounded-lg border border-neutral-300 bg-white outline-hidden font-bold text-neutral-950"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tax Box */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-neutral-950" />
                    Opsi PPN / Pajak
                  </label>
                  <input
                    type="checkbox"
                    checked={invoice.tax.enabled}
                    onChange={(e) =>
                      onChange({
                        ...invoice,
                        tax: { ...invoice.tax, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded accent-neutral-950 cursor-pointer"
                  />
                </div>

                {invoice.tax.enabled && (
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-xs text-neutral-600">Tarif PPN:</span>
                    <input
                      type="number"
                      value={invoice.tax.percentage}
                      onChange={(e) =>
                        onChange({
                          ...invoice,
                          tax: {
                            ...invoice.tax,
                            percentage: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-20 px-2 py-1.5 text-xs text-center font-mono rounded-lg border border-neutral-300 bg-white outline-hidden font-bold"
                    />
                    <span className="text-xs font-bold text-neutral-700">%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bank BCA & QRIS Payment Settings */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-neutral-700" />
                Informasi Rekening Bank BCA & QRIS
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-600">Nama Bank</label>
                  <input
                    type="text"
                    value={invoice.paymentDetails.bankName}
                    onChange={(e) =>
                      onChange({
                        ...invoice,
                        paymentDetails: {
                          ...invoice.paymentDetails,
                          bankName: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 outline-hidden font-medium"
                    placeholder="Bank BCA"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-600">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    value={invoice.paymentDetails.bankAccount}
                    onChange={(e) =>
                      onChange({
                        ...invoice,
                        paymentDetails: {
                          ...invoice.paymentDetails,
                          bankAccount: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 outline-hidden text-neutral-900"
                    placeholder="8720-9988-12"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-600">Atas Nama</label>
                  <input
                    type="text"
                    value={invoice.paymentDetails.accountHolder}
                    onChange={(e) =>
                      onChange({
                        ...invoice,
                        paymentDetails: {
                          ...invoice.paymentDetails,
                          accountHolder: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 outline-hidden font-medium"
                    placeholder="OTAKATIKIDE STUDIO"
                  />
                </div>
              </div>

              {/* QRIS Upload / Toggle */}
              <div className="pt-2 border-t border-neutral-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showQrisToggle"
                    checked={invoice.paymentDetails.showQris}
                    onChange={(e) =>
                      onChange({
                        ...invoice,
                        paymentDetails: {
                          ...invoice.paymentDetails,
                          showQris: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-neutral-900"
                  />
                  <label htmlFor="showQrisToggle" className="text-xs font-bold text-neutral-800 cursor-pointer">
                    Tampilkan Kotak QRIS di Invoice
                  </label>
                </div>

                {invoice.paymentDetails.showQris && (
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-800 flex items-center gap-1.5 cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Gambar QRIS Asli</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrisUpload}
                        className="hidden"
                      />
                    </label>
                    {invoice.paymentDetails.qrisImageUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            ...invoice,
                            paymentDetails: {
                              ...invoice.paymentDetails,
                              qrisImageUrl: '',
                            },
                          })
                        }
                        className="text-[11px] text-rose-600 hover:underline"
                      >
                        Reset ke QRIS Bawaan
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TERMS & NOTES */}
        {activeTab === 'terms' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-neutral-950 text-sm">Catatan & Syarat Ketentuan</h3>
              <p className="text-xs text-neutral-500">
                Pesan apresiasi dan ketentuan revisi, hak cipta, atau batas waktu pengerjaan.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                Catatan Singkat untuk Klien
              </label>
              <textarea
                rows={3}
                value={invoice.notes}
                onChange={(e) => onChange({ ...invoice, notes: e.target.value })}
                placeholder="Terima kasih telah mempercayakan proyek branding Anda kepada otakatikide..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-hidden leading-relaxed"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Daftar Syarat & Ketentuan (Poin per Poin)
                </label>
                <button
                  type="button"
                  onClick={handleAddTerm}
                  className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Ketentuan
                </button>
              </div>

              <div className="space-y-2">
                {invoice.terms.map((term, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-xs font-mono font-bold text-neutral-400 pt-2">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={term}
                      onChange={(e) => handleUpdateTerm(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteTerm(idx)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STUDIO PROFILE */}
        {activeTab === 'studio' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-neutral-950 text-sm">Profil Studio otakatikide</h3>
              <p className="text-xs text-neutral-500">
                Informasi identitas studio desain yang tercantum pada kop invoice.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Nama Studio
                </label>
                <input
                  type="text"
                  value={invoice.studio.name}
                  onChange={(e) =>
                    onChange({
                      ...invoice,
                      studio: { ...invoice.studio, name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 outline-hidden font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Tagline / Spesialisasi
                </label>
                <input
                  type="text"
                  value={invoice.studio.tagline}
                  onChange={(e) =>
                    onChange({
                      ...invoice,
                      studio: { ...invoice.studio, tagline: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Email Studio
                </label>
                <input
                  type="email"
                  value={invoice.studio.email}
                  onChange={(e) =>
                    onChange({
                      ...invoice,
                      studio: { ...invoice.studio, email: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  No. Telepon / HP
                </label>
                <input
                  type="text"
                  value={invoice.studio.phone}
                  onChange={(e) =>
                    onChange({
                      ...invoice,
                      studio: { ...invoice.studio, phone: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 outline-hidden font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Portfolio / Instagram Link
                </label>
                <input
                  type="text"
                  value={invoice.studio.portfolio}
                  onChange={(e) =>
                    onChange({
                      ...invoice,
                      studio: { ...invoice.studio, portfolio: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Alamat / Domisili
                </label>
                <input
                  type="text"
                  value={invoice.studio.address}
                  onChange={(e) =>
                    onChange({
                      ...invoice,
                      studio: { ...invoice.studio, address: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-neutral-900/10 outline-hidden"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
