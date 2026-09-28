import React, { useState } from 'react';
import {
  FileText,
  User,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Clock,
  Layers,
  ArrowRight,
  FileCheck2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Percent,
  Receipt,
  HelpCircle,
  Copy,
  Info,
  Star,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { QuotationData, LineItem, QuotationStatus, QuotationOption } from '../types';
import { PRESET_SERVICES, ServicePreset } from '../utils/presets';
import { calculateQuotation, SAMPLE_PRICING_CARDS_OPTIONS } from '../utils/quotationStorage';
import { formatRupiah } from '../utils/formatters';

interface QuotationEditorProps {
  quotation: QuotationData;
  onChange: (updated: QuotationData) => void;
  onConvertToInvoice: () => void;
}

const QUOTATION_PACKAGE_PRESETS: ServicePreset[] = [
  ...PRESET_SERVICES,
  {
    title: 'Paket Brand Identity Baru (Startup & UMKM)',
    description:
      '3 Konsep logo orisinal, filosofi desain, visual guide satu halaman, palet warna, tipografi, dan file siap cetak & digital (PNG, PDF, AI vector).',
    price: 2500000,
  },
  {
    title: 'Paket Rebranding & Modernisasi Visual Komprehensif',
    description:
      'Audit visual brand lama, restrukturisasi identitas visual, logo system, packaging & label guidelines, signage mockup, dan guideline lengkap 30+ hal.',
    price: 5500000,
  },
  {
    title: 'Paket Media Kit & Social Media Templates (30 Hari)',
    description:
      '30 Desain feed posting, 10 story interactive, profil banner, highlight cover icon, dan template feed promosi di Figma & Canva.',
    price: 2400000,
  },
];

export const QuotationEditor: React.FC<QuotationEditorProps> = ({
  quotation,
  onChange,
  onConvertToInvoice,
}) => {
  const [activeTab, setActiveTab] = useState<'klien' | 'lingkup' | 'keuangan' | 'ketentuan'>('lingkup');
  const [showPresetsModal, setShowPresetsModal] = useState(false);

  const calc = calculateQuotation(quotation);
  const currentOptions: QuotationOption[] = quotation.options || [];
  const selectedOptionIds = quotation.selectedOptionIds || [];

  // Field update helpers
  const handleUpdate = <K extends keyof QuotationData>(field: K, value: QuotationData[K]) => {
    onChange({
      ...quotation,
      [field]: value,
    });
  };

  const handleUpdateClient = (field: keyof QuotationData['client'], value: string) => {
    onChange({
      ...quotation,
      client: {
        ...quotation.client,
        [field]: value,
      },
    });
  };

  // Option Handlers
  const handleAddOption = (category = 'Jasa Desain Logo') => {
    const defaultPrefix = category.includes('Logo') ? 'Logo' : 'Kemasan';
    const existingCount = currentOptions.filter((o) => o.category === category).length;
    const newOpt: QuotationOption = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      category: category,
      title: `${defaultPrefix} Opsi ${existingCount + 1}`,
      description: 'Detail spesifikasi deliverables, konsep desain, batasan revisi, dan file master.',
      price: category.includes('Logo') ? 1500000 : 1800000,
      timeline: '3 - 5 Hari Kerja',
    };
    handleUpdate('options', [...currentOptions, newOpt]);
  };

  const handleUpdateOption = (index: number, field: keyof QuotationOption, value: any) => {
    const updated = [...currentOptions];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    handleUpdate('options', updated);
  };

  const handleRemoveOption = (index: number) => {
    if (currentOptions.length <= 1) {
      alert('Surat penawaran minimal harus memiliki 1 opsi layanan.');
      return;
    }
    const targetId = currentOptions[index].id;
    const updated = currentOptions.filter((_, i) => i !== index);
    const updatedSelected = selectedOptionIds.filter((id) => id !== targetId);
    onChange({
      ...quotation,
      options: updated,
      selectedOptionIds: updatedSelected,
    });
  };

  const handleToggleDealOption = (optionId: string) => {
    const exists = selectedOptionIds.includes(optionId);
    let newSelected: string[];
    if (exists) {
      newSelected = selectedOptionIds.filter((id) => id !== optionId);
    } else {
      newSelected = [...selectedOptionIds, optionId];
    }
    onChange({
      ...quotation,
      selectedOptionIds: newSelected,
      status: newSelected.length > 0 ? 'accepted' : quotation.status,
    });
  };

  const handleClearDeal = () => {
    onChange({
      ...quotation,
      selectedOptionIds: [],
    });
  };

  const handleLoadSampleCards = () => {
    onChange({
      ...quotation,
      options: SAMPLE_PRICING_CARDS_OPTIONS,
      optionsLayout: 'cards',
      selectedOptionIds: [],
    });
  };

  // Line Item Handlers (Legacy fallback support)
  const handleAddItem = () => {
    const newItem: LineItem = {
      id: `item_${Date.now()}`,
      description: 'Layanan Kreatif / Desain Tambahan',
      details: 'Spesifikasi deliverables dan ruang lingkup pekerjaan',
      qty: 1,
      price: 1000000,
    };
    handleUpdate('items', [...quotation.items, newItem]);
  };

  const handleUpdateItem = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...quotation.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    handleUpdate('items', updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    if (quotation.items.length <= 1) {
      alert('Surat penawaran minimal harus memiliki 1 item layanan.');
      return;
    }
    const updatedItems = quotation.items.filter((_, i) => i !== index);
    handleUpdate('items', updatedItems);
  };

  const handleAddPreset = (preset: ServicePreset) => {
    const newItem: LineItem = {
      id: `preset_${Date.now()}`,
      description: preset.title,
      details: preset.description,
      qty: 1,
      price: preset.price,
    };
    handleUpdate('items', [...quotation.items, newItem]);
    setShowPresetsModal(false);
  };

  // Terms handlers
  const handleAddTerm = () => {
    const newTerms = [...quotation.terms, 'Ketentuan atau batasan pengerjaan baru.'];
    handleUpdate('terms', newTerms);
  };

  const handleUpdateTerm = (index: number, value: string) => {
    const newTerms = [...quotation.terms];
    newTerms[index] = value;
    handleUpdate('terms', newTerms);
  };

  const handleRemoveTerm = (index: number) => {
    const newTerms = quotation.terms.filter((_, i) => i !== index);
    handleUpdate('terms', newTerms);
  };

  // Quick validity buttons
  const setValidityDays = (days: number) => {
    const baseDate = new Date(quotation.quotationDate || Date.now());
    const validDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
    handleUpdate('validUntilDate', validDate.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-4">
      {/* High-Impact "Convert to Invoice" Action Banner */}
      <div className="bg-neutral-950 text-white p-4 rounded-2xl border border-neutral-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFD400] animate-pulse"></span>
            <h3 className="font-extrabold text-sm text-white font-display">
              Konversi ke Invoice Resmi
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFD400]/20 text-[#FFD400] border border-[#FFD400]/40">
              1-Klik
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            {calc.hasDeal
              ? `Klien sudah deal dengan ${calc.selectedOptions.length} opsi pilihan (Total ${formatRupiah(calc.grandTotal)}). Terbitkan invoice penagihan sekarang!`
              : 'Status opsi terbuka. Anda dapat mencentang opsi deal klien terlebih dahulu agar rincian invoice terisi otomatis.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onConvertToInvoice}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-[#FFD400] hover:bg-[#E6BE00] active:bg-[#CCAA00] text-neutral-950 text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-sm border border-[#E6BE00]"
        >
          <Receipt className="w-4 h-4 text-neutral-950" />
          <span>Buat Invoice dari SPH Ini</span>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-950" />
        </button>
      </div>

      {/* Editor Sub-Navigation Tabs */}
      <div className="bg-white p-1 rounded-xl border border-neutral-200 grid grid-cols-4 gap-1 text-xs font-bold text-neutral-600 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('klien')}
          className={`py-2 px-1 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'klien'
              ? 'bg-neutral-950 text-white shadow-xs'
              : 'hover:text-neutral-950 hover:bg-neutral-50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span className="truncate">Calon Klien</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lingkup')}
          className={`py-2 px-1 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'lingkup'
              ? 'bg-neutral-950 text-white shadow-xs'
              : 'hover:text-neutral-950 hover:bg-neutral-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="truncate">Opsi Layanan ({currentOptions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('keuangan')}
          className={`py-2 px-1 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'keuangan'
              ? 'bg-neutral-950 text-white shadow-xs'
              : 'hover:text-neutral-950 hover:bg-neutral-50'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          <span className="truncate">Pajak & Termin</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ketentuan')}
          className={`py-2 px-1 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'ketentuan'
              ? 'bg-neutral-950 text-white shadow-xs'
              : 'hover:text-neutral-950 hover:bg-neutral-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="truncate">Syarat Kerja</span>
        </button>
      </div>

      {/* TAB 1: CALON KLIEN & METADATA SURAT */}
      {activeTab === 'klien' && (
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="border-b border-neutral-200 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FFD400]" />
              Identitas Surat & Status Penawaran
            </h4>
            <p className="text-xs text-neutral-500">
              Pengaturan nomor referensi dokumen dan masa berlaku penawaran resmi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                Nomor Surat Penawaran (SPH)
              </label>
              <input
                type="text"
                value={quotation.quotationNumber}
                onChange={(e) => handleUpdate('quotationNumber', e.target.value)}
                placeholder="SPH/OAI/2026/09/001"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                Status Penawaran
              </label>
              <select
                value={quotation.status}
                onChange={(e) => handleUpdate('status', e.target.value as QuotationStatus)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950 bg-white"
              >
                <option value="draft">Draf Penawaran (Internal)</option>
                <option value="sent">Proposal Terkirim ke Klien</option>
                <option value="accepted">Disetujui Klien (Deal / PO)</option>
                <option value="rejected">Ditolak / Batal</option>
                <option value="expired">Kedaluwarsa (Expired)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                Tanggal Terbit Penawaran
              </label>
              <input
                type="date"
                value={quotation.quotationDate}
                onChange={(e) => handleUpdate('quotationDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950 font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-bold text-neutral-700 uppercase">
                  Masa Berlaku Hingga
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setValidityDays(7)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold cursor-pointer"
                  >
                    +7 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setValidityDays(14)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold cursor-pointer"
                  >
                    +14 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setValidityDays(30)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold cursor-pointer"
                  >
                    +30 Hari
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={quotation.validUntilDate}
                onChange={(e) => handleUpdate('validUntilDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950 font-medium"
              />
            </div>
          </div>

          {/* Client Details */}
          <div className="border-t border-neutral-200 pt-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-[#FFD400]" />
              Data Calon Klien Baru (Prospect Client)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                  Nama Klien / Contact Person (PIC) *
                </label>
                <input
                  type="text"
                  value={quotation.client.name}
                  onChange={(e) => handleUpdateClient('name', e.target.value)}
                  placeholder="Contoh: Bpk. Kevin Wijaya"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                  Perusahaan / Brand Klien
                </label>
                <input
                  type="text"
                  value={quotation.client.company}
                  onChange={(e) => handleUpdateClient('company', e.target.value)}
                  placeholder="Contoh: PT Senja Rasa Kreasi / Kopi Senja"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  value={quotation.client.whatsapp}
                  onChange={(e) => handleUpdateClient('whatsapp', e.target.value)}
                  placeholder="08123456789 atau 628123456789"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                  Email Klien
                </label>
                <input
                  type="email"
                  value={quotation.client.email}
                  onChange={(e) => handleUpdateClient('email', e.target.value)}
                  placeholder="kevin@senjarasa.id"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                  Alamat / Lokasi Klien
                </label>
                <input
                  type="text"
                  value={quotation.client.address}
                  onChange={(e) => handleUpdateClient('address', e.target.value)}
                  placeholder="Jl. Kebayoran Baru, Jakarta Selatan, DKI Jakarta"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
            </div>
          </div>

          {/* Subject & Intro */}
          <div className="border-t border-neutral-200 pt-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#FFD400]" />
              Perihal & Salam Pengantar Surat
            </h4>

            <div className="text-xs">
              <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                Perihal Proyek
              </label>
              <input
                type="text"
                value={quotation.subject}
                onChange={(e) => handleUpdate('subject', e.target.value)}
                placeholder="Penawaran Kerjasama Jasa Brand Identity & Media Launch Kit"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-extrabold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>

            <div className="text-xs">
              <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                Paragraf Salam Pembuka & Pengantar
              </label>
              <textarea
                rows={3}
                value={quotation.introduction}
                onChange={(e) => handleUpdate('introduction', e.target.value)}
                placeholder="Dengan hormat, sehubungan dengan rencana pengembangan identitas visual..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-950 resize-y leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPSI PENAWARAN JASA & DEAL KLIEN */}
      {activeTab === 'lingkup' && (
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FFD400]" />
                Opsi-Opsi Penawaran Jasa ({currentOptions.length} Opsi Tersedia)
              </h4>
              <p className="text-xs text-neutral-500">
                Kelola paket opsi penawaran (misal: Basic Logo, Basic Branding Produk, Basic Promosi).
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleLoadSampleCards}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <span>⚡ Muat Contoh Gambar</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddOption('Paket Desain')}
                className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#FFD400]" />
                <span>+ Tambah Opsi</span>
              </button>
            </div>
          </div>

          {/* Model Tampilan Opsi: Kartu Pricing (Modern) vs Tabel Klasik */}
          <div className="p-3 rounded-xl bg-neutral-100/90 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-700">Model Tampilan Surat:</span>
              <div className="inline-flex p-0.5 bg-white rounded-lg border border-neutral-300 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleUpdate('optionsLayout', 'cards')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                    quotation.optionsLayout !== 'table'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-[#FFD400]" />
                  <span>Model Kartu Pricing (Seperti Contoh Gambar)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate('optionsLayout', 'table')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                    quotation.optionsLayout === 'table'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Model Tabel Klasik</span>
                </button>
              </div>
            </div>
          </div>

          {/* Deal Selection Section (Highlight Card) */}
          <div className="p-4 rounded-xl border-2 border-neutral-900 bg-neutral-950 text-white space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFD400] animate-pulse"></span>
                <span className="text-xs font-black uppercase tracking-wider text-white font-display">
                  Status Deal & Pilihan Klien
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  {selectedOptionIds.length > 0 ? `${selectedOptionIds.length} Opsi Deal` : 'Belum Ada Deal'}
                </span>
              </div>
              {selectedOptionIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearDeal}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
                >
                  Reset (Buka Kembali Penawaran Opsi)
                </button>
              )}
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {selectedOptionIds.length > 0
                ? '✅ Klien telah menyepakati opsi berikut. Total biaya resmi sekarang ditampilkan di lembar penawaran.'
                : '💡 Total biaya saat ini disembunyikan dari lembar penawaran. Total biaya akan muncul otomatis setelah Anda mencentang opsi yang disepakati (deal) oleh klien di bawah ini.'}
            </p>

            {/* Quick Deal Checkbox Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {currentOptions.map((opt) => {
                const isSelected = selectedOptionIds.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleToggleDealOption(opt.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-amber-400/20 border-[#FFD400] text-white shadow-2xs'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isSelected ? 'bg-[#FFD400] text-neutral-950' : 'border border-neutral-600'
                        }`}
                      >
                        {isSelected && '✓'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{opt.title}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{opt.category}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#FFD400] shrink-0 pl-2">
                      {formatRupiah(opt.price)}
                    </span>
                  </div>
                );
              })}
            </div>

            {selectedOptionIds.length > 0 && (
              <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-medium">Total Investasi Deal:</span>
                <span className="font-mono text-base text-[#FFD400] font-black">
                  {formatRupiah(calc.grandTotal)}
                </span>
              </div>
            )}
          </div>

          {/* List of Option Cards to Edit */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                Edit Rincian Opsi ({currentOptions.length} Item):
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddOption('Jasa Desain Logo')}
                  className="text-[10px] px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold cursor-pointer"
                >
                  + Opsi Desain Logo
                </button>
                <button
                  type="button"
                  onClick={() => handleAddOption('Jasa Desain Kemasan')}
                  className="text-[10px] px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold cursor-pointer"
                >
                  + Opsi Desain Kemasan
                </button>
              </div>
            </div>

            {currentOptions.map((opt, idx) => {
              const isSelected = selectedOptionIds.includes(opt.id);
              return (
                <div
                  key={opt.id || idx}
                  className={`p-4 rounded-xl border transition space-y-3 ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-400/50'
                      : 'border-neutral-200 bg-neutral-50/60 hover:border-neutral-300'
                  }`}
                >
                  {/* Top Bar of Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/80 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-950 text-white">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={opt.title}
                        onChange={(e) => handleUpdateOption(idx, 'title', e.target.value)}
                        placeholder="Judul Opsi (misal: Logo Opsi 1 / Kemasan Opsi 2)"
                        className="font-bold text-sm text-neutral-950 bg-white border border-neutral-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-neutral-950 w-full sm:w-80"
                      />
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleUpdateOption(idx, 'isPopular', !opt.isPopular)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                          opt.isPopular
                            ? 'bg-[#FFD400] text-neutral-950 border-amber-500 shadow-2xs font-extrabold'
                            : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-100'
                        }`}
                        title="Tampilkan badge 'PALING DIMINATI' di atas kartu"
                      >
                        <Star
                          className={`w-3 h-3 ${
                            opt.isPopular ? 'fill-neutral-950 text-neutral-950' : 'text-neutral-400'
                          }`}
                        />
                        <span>{opt.isPopular ? 'Paling Diminati ⭐' : 'Tandai Populer'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleDealOption(opt.id)}
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-500 text-neutral-950 border-amber-600 shadow-2xs'
                            : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        <span>{isSelected ? '✓ OPSI DEAL' : 'Tandai Deal'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        title="Hapus Opsi ini"
                        className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtitle / Ringkasan Deskripsi */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-600 mb-1">
                      Sub-judul / Penjelasan Singkat (Muncul di Bawah Judul Paket)
                    </label>
                    <input
                      type="text"
                      value={opt.subtitle || ''}
                      onChange={(e) => handleUpdateOption(idx, 'subtitle', e.target.value)}
                      placeholder="Contoh: LOGO + DESAIN PRODUK. Solusi lengkap untuk brand yang ingin tampil konsisten."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950"
                    />
                  </div>

                  {/* Metadata Fields: Category, Timeline, Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] uppercase font-bold text-neutral-600 mb-1">
                        Kategori Layanan
                      </label>
                      <input
                        type="text"
                        value={opt.category}
                        onChange={(e) => handleUpdateOption(idx, 'category', e.target.value)}
                        placeholder="Contoh: Jasa Desain Logo, Jasa Desain Kemasan"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 font-semibold focus:outline-none focus:ring-1 focus:ring-neutral-950"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] uppercase font-bold text-neutral-600 mb-1">
                        Estimasi Durasi
                      </label>
                      <input
                        type="text"
                        value={opt.timeline || ''}
                        onChange={(e) => handleUpdateOption(idx, 'timeline', e.target.value)}
                        placeholder="3 - 5 Hari Kerja"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] uppercase font-bold text-neutral-600 mb-1">
                        Harga Opsi (Rp)
                      </label>
                      <input
                        type="number"
                        step="50000"
                        value={opt.price}
                        onChange={(e) =>
                          handleUpdateOption(idx, 'price', parseInt(e.target.value) || 0)
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white font-mono font-bold text-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                      />
                    </div>
                  </div>

                  {/* Description / Deliverables */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-600 mb-1">
                      Keterangan Deliverables & Spesifikasi Pekerjaan (Pisahkan per baris untuk checklist ✓)
                    </label>
                    <textarea
                      rows={3}
                      value={opt.description}
                      onChange={(e) => handleUpdateOption(idx, 'description', e.target.value)}
                      placeholder="Contoh:&#10;2 Opsi Konsep Logo Eksklusif&#10;Pilih 1, Revisi 3x&#10;File Master Lengkap (CDR/AI, EPS, PNG, PDF)&#10;Hak Cipta 100% Milik Klien"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs text-neutral-800 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-950 leading-relaxed resize-y font-mono text-[11px]"
                    />
                  </div>

                  {/* Teks Tombol Aksi Bawah Kartu */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-600 mb-1">
                      Teks Tombol Aksi Bawah Kartu (Opsional)
                    </label>
                    <input
                      type="text"
                      value={opt.ctaText || ''}
                      onChange={(e) => handleUpdateOption(idx, 'ctaText', e.target.value)}
                      placeholder="Default: Pesan & Tanya Info Opsi Lain"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: KEUANGAN, PAJAK & SKEMA PEMBAYARAN */}
      {activeTab === 'keuangan' && (
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="border-b border-neutral-200 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#FFD400]" />
              Pengaturan Pajak & Skema Pembayaran
            </h4>
            <p className="text-xs text-neutral-500">
              Konfigurasi pajak PPN dan rincian termin pembayaran untuk klien.
            </p>
          </div>

          {/* Deal & Total Cost Notice */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-neutral-700">Status Biaya Penawaran:</span>
              {calc.hasDeal ? (
                <span className="px-2 py-0.5 rounded font-black text-[10px] uppercase bg-amber-100 text-amber-950 border border-amber-400">
                  ✓ Deal Terpilih ({calc.selectedOptions.length} Opsi)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded font-black text-[10px] uppercase bg-neutral-200 text-neutral-700">
                  Opsi Terbuka (Total Disembunyikan)
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-600">
              {calc.hasDeal
                ? `Total Investasi disepakati: ${formatRupiah(calc.grandTotal)}. Nilai ini ditampilkan di lembar penawaran.`
                : 'Sesuai permintaan penawaran opsi, total biaya awal disembunyikan sampai klien memilih opsi di Tab "Opsi Layanan".'}
            </p>
          </div>

          {/* Tax Section */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tax-toggle"
                  checked={quotation.tax.enabled}
                  onChange={(e) =>
                    onChange({
                      ...quotation,
                      tax: { ...quotation.tax, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-neutral-950 focus:ring-neutral-950 accent-neutral-950 cursor-pointer"
                />
                <label
                  htmlFor="tax-toggle"
                  className="text-xs font-bold text-neutral-900 cursor-pointer"
                >
                  Kenakan Pajak Pertambahan Nilai (PPN)
                </label>
              </div>
            </div>

            {quotation.tax.enabled && (
              <div className="w-full sm:w-48 text-xs pt-1">
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                  Persentase PPN (%)
                </label>
                <input
                  type="number"
                  value={quotation.tax.percentage}
                  onChange={(e) =>
                    onChange({
                      ...quotation,
                      tax: {
                        ...quotation.tax,
                        percentage: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono font-bold text-neutral-900 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Payment Terms Details */}
          <div className="space-y-3 pt-2 border-t border-neutral-200">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#FFD400]" />
              Ketentuan Skema Pembayaran Proyek
            </h4>

            <div className="text-xs">
              <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                Deskripsi Tahapan Pembayaran
              </label>
              <textarea
                rows={3}
                value={quotation.paymentTerms}
                onChange={(e) => handleUpdate('paymentTerms', e.target.value)}
                placeholder="Tahap 1: DP 50% saat surat penawaran disetujui..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-950 resize-y leading-relaxed font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TIMELINE, CATATAN & SYARAT KERJA */}
      {activeTab === 'ketentuan' && (
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="border-b border-neutral-200 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FFD400]" />
              Estimasi Waktu (Timeline) & Syarat Ketentuan
            </h4>
            <p className="text-xs text-neutral-500">
              Jelaskan estimasi pengerjaan serta batasan ruang lingkup agar tidak terjadi revisi berlebih.
            </p>
          </div>

          <div className="text-xs">
            <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
              Estimasi Durasi Pengerjaan (Timeline)
            </label>
            <input
              type="text"
              value={quotation.timeline}
              onChange={(e) => handleUpdate('timeline', e.target.value)}
              placeholder="Contoh: 14 - 21 Hari Kerja (setelah DP & brief lengkap diterima)"
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
            />
          </div>

          <div className="text-xs">
            <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
              Catatan Khusus / Keunggulan Layanan
            </label>
            <textarea
              rows={2}
              value={quotation.notes}
              onChange={(e) => handleUpdate('notes', e.target.value)}
              placeholder="Seluruh proses perancangan dikerjakan dengan standar riset visual..."
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-950 resize-y"
            />
          </div>

          {/* List of terms */}
          <div className="border-t border-neutral-200 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                Poin Syarat & Ketentuan Penawaran:
              </h5>
              <button
                type="button"
                onClick={handleAddTerm}
                className="text-xs text-neutral-900 hover:text-black font-bold flex items-center gap-1 cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Poin</span>
              </button>
            </div>

            <div className="space-y-2">
              {quotation.terms.map((term, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-neutral-400 w-5 text-right shrink-0">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => handleUpdateTerm(idx, e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTerm(idx)}
                    title="Hapus syarat"
                    className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 transition cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Presets Selection Modal */}
      {showPresetsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-neutral-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFD400]" />
                  Pilih Preset Paket Layanan Studio
                </h3>
                <p className="text-xs text-neutral-500">
                  Klik pada paket untuk langsung menambahkannya ke dalam penawaran.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPresetsModal(false)}
                className="text-neutral-400 hover:text-neutral-950 text-xs font-bold px-2 py-1 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
              >
                Tutup ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
              {QUOTATION_PACKAGE_PRESETS.map((preset, i) => (
                <div
                  key={i}
                  onClick={() => handleAddPreset(preset)}
                  className="p-3 rounded-xl border border-neutral-200 hover:border-neutral-950 hover:bg-neutral-50/80 transition cursor-pointer space-y-1 group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-xs text-neutral-900 group-hover:text-black">
                      {preset.title}
                    </h4>
                    <span className="font-mono font-black text-xs text-neutral-950 shrink-0">
                      {formatRupiah(preset.price)}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-snug">
                    {preset.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
