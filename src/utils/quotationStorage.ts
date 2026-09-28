import {
  QuotationData,
  SavedQuotation,
  InvoiceData,
  LineItem,
  QuotationOption,
} from '../types';
import {
  getStoredStudioProfile,
  getStoredPaymentDetails,
  generateNextInvoiceNumber,
} from './invoiceStorage';

const STORAGE_KEY = 'otakatikide_saved_quotations';

export const SAMPLE_PRICING_CARDS_OPTIONS: QuotationOption[] = [
  {
    id: 'opt_basic_logo',
    category: 'Paket Desain Logo',
    title: 'Basic Logo',
    subtitle: 'DESAIN LOGO - Untuk UMKM atau bisnis baru yang membutuhkan logo profesional.',
    price: 350000,
    timeline: '2–3 Hari Kerja',
    description: `2 Opsi Konsep Logo Eksklusif
Pilih 1, Revisi 3x
Panduan Warna & Tipografi Ringkas
File Master Lengkap (CDR/AI, EPS, PNG, PDF)
Pengerjaan 2–3 Hari Kerja
Hak Cipta 100% Milik Klien`,
    isPopular: false,
    ctaText: 'Pesan & Tanya Info Opsi Lain',
  },
  {
    id: 'opt_basic_branding',
    category: 'Paket Branding Produk',
    title: 'Basic Branding Produk',
    subtitle: 'LOGO + DESAIN PRODUK. Solusi lengkap untuk brand yang ingin tampil konsisten dan siap scale-up pasar.',
    price: 530000,
    timeline: '3–5 Hari Kerja',
    description: `1 Opsi Logo + 1 Desain Kemasan
Batas Revisi 4x
Copywriting Redaksi Materi Kemasan
Pengerjaan 3–5 Hari Kerja
Hak Cipta 100% Milik Klien`,
    isPopular: true,
    ctaText: 'Pesan & Tanya Info Opsi Lain',
  },
  {
    id: 'opt_basic_promosi',
    category: 'Paket Promosi Sosmed',
    title: 'Basic Promosi',
    subtitle: 'PAKET PROMOSI SOSMED. Jasa Konten Promosi Produk/Perusahaan',
    price: 360000,
    timeline: '3–5 Hari Kerja',
    description: `Paket 15 Konten Promosi
13 Feed statis, 2 Reel
Draft konsep materi dari klien
Minor Revisi 1x
Opsi Paket lain hub Admin`,
    isPopular: false,
    ctaText: 'Pesan & Tanya Info Opsi Lain',
  },
];

export const INITIAL_QUOTATION_OPTIONS: QuotationOption[] = SAMPLE_PRICING_CARDS_OPTIONS;

export const INITIAL_QUOTATION_DATA: QuotationData = {
  quotationNumber: 'SPH/OAI/2026/09/001',
  quotationDate: new Date().toISOString().split('T')[0],
  validUntilDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  subject: 'Penawaran Kerjasama Jasa Brand Identity & Media Launch Kit',
  introduction:
    'Dengan hormat, sehubungan dengan rencana pengembangan identitas visual dan kemasan bisnis Anda, kami dari otakatikide mengajukan rincian opsi penawaran jasa (scope of work) serta alternatif investasi sebagai berikut:',
  studio: getStoredStudioProfile(),
  client: {
    name: 'Bpk. Kevin Wijaya',
    company: 'PT Senja Rasa Kreasi',
    whatsapp: '6281234567890',
    email: 'kevin@senjarasa.id',
    address: 'Kebayoran Baru, Jakarta Selatan, DKI Jakarta',
  },
  items: [
    {
      id: 'quo_1',
      description: 'Brand Identity & Visual System Eksklusif',
      details:
        'Riset visual, moodboard arah desain, 3 alternatif konsep logo utama, filosofi logo, palet warna, tipografi, dan master file (AI, EPS, SVG, PNG High-Res).',
      qty: 1,
      price: 3500000,
    },
  ],
  options: SAMPLE_PRICING_CARDS_OPTIONS,
  optionsLayout: 'cards',
  selectedOptionIds: [],
  discount: {
    enabled: false,
    type: 'fixed',
    value: 0,
  },
  tax: {
    enabled: false,
    percentage: 11,
  },
  timeline: 'Sesuai opsi durasi kerja sama yang dipilih klien',
  paymentTerms:
    'Tahap 1: DP 50% setelah opsi pilihan disepakati (deal) untuk memulai pengerjaan konsep.\nTahap 2: Pelunasan 50% setelah konsep final disetujui, sebelum penyerahan seluruh Master File.',
  paymentDetails: getStoredPaymentDetails(),
  notes:
    'Seluruh proses perancangan dikerjakan dengan standar riset visual, originalitas tinggi, dan pendampingan konsultasi desain eksklusif oleh tim otakatikide.',
  terms: [
    'Masa berlaku penawaran harga ini adalah 14 (empat belas) hari kalender sejak tanggal surat diterbitkan.',
    'Pengerjaan proyek akan dijadwalkan secara resmi setelah konfirmasi persetujuan opsi pilihan dan pembayaran Down Payment (DP) 50% diterima.',
    'Termasuk revisi minor pada konsep desain opsi yang dipilih oleh klien.',
    'Permintaan penambahan ruang lingkup pekerjaan di luar opsi yang disepakati akan dikenakan biaya addendum terpisah.',
    'Hak cipta kepemilikan dan seluruh file master desain beresolusi tinggi dialihkan penuh kepada pihak klien setelah pelunasan 100% terselesaikan.',
  ],
  currency: 'IDR',
  status: 'draft',
  clientApprovalNotes: '',
};

export interface QuotationCalculation {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  hasDeal: boolean;
  selectedOptionsTotal: number;
  selectedOptions: QuotationOption[];
}

export function calculateQuotation(quotation: QuotationData): QuotationCalculation {
  const options = quotation.options || [];
  const selectedOptionIds = quotation.selectedOptionIds || [];

  if (options.length > 0) {
    const selectedOptions = options.filter(opt => selectedOptionIds.includes(opt.id));
    const hasDeal = selectedOptions.length > 0;
    const selectedOptionsTotal = selectedOptions.reduce(
      (sum, opt) => sum + (Number(opt.price) || 0),
      0
    );

    if (hasDeal) {
      const subtotal = selectedOptionsTotal;
      let taxAmount = 0;
      if (quotation.tax?.enabled) {
        taxAmount = (subtotal * (Number(quotation.tax.percentage) || 0)) / 100;
      }
      const grandTotal = subtotal + taxAmount;
      return {
        subtotal,
        discountAmount: 0,
        taxAmount,
        grandTotal,
        hasDeal: true,
        selectedOptionsTotal,
        selectedOptions,
      };
    } else {
      // Belum ada deal: total biaya dihapus/disembunyikan terlebih dahulu
      return {
        subtotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        grandTotal: 0,
        hasDeal: false,
        selectedOptionsTotal: 0,
        selectedOptions: [],
      };
    }
  }

  // Fallback for legacy items if options not present
  const subtotal = (quotation.items || []).reduce((sum, item) => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    return sum + qty * price;
  }, 0);

  let taxAmount = 0;
  if (quotation.tax?.enabled) {
    taxAmount = (subtotal * (Number(quotation.tax.percentage) || 0)) / 100;
  }
  const grandTotal = Math.max(0, subtotal + taxAmount);

  return {
    subtotal,
    discountAmount: 0,
    taxAmount,
    grandTotal,
    hasDeal: false,
    selectedOptionsTotal: 0,
    selectedOptions: [],
  };
}

export function getSavedQuotations(): SavedQuotation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: SavedQuotation[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to parse saved quotations:', err);
    return [];
  }
}

export function saveQuotationToStorage(quotation: QuotationData): SavedQuotation {
  const currentList = getSavedQuotations();
  const calc = calculateQuotation(quotation);

  const existingIndex = currentList.findIndex(
    item => item.quotationNumber.trim().toLowerCase() === quotation.quotationNumber.trim().toLowerCase()
  );

  const savedRecord: SavedQuotation = {
    id: existingIndex >= 0 ? currentList[existingIndex].id : `quo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    quotationNumber: quotation.quotationNumber,
    clientName: quotation.client.name,
    clientCompany: quotation.client.company,
    subject: quotation.subject,
    quotationDate: quotation.quotationDate,
    validUntilDate: quotation.validUntilDate,
    grandTotal: calc.grandTotal,
    status: quotation.status,
    updatedAt: new Date().toISOString(),
    data: quotation,
  };

  let updatedList: SavedQuotation[];
  if (existingIndex >= 0) {
    updatedList = [...currentList];
    updatedList[existingIndex] = savedRecord;
  } else {
    updatedList = [savedRecord, ...currentList];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Failed to save quotation to localStorage:', err);
  }

  return savedRecord;
}

export function deleteSavedQuotationFromStorage(id: string): SavedQuotation[] {
  const currentList = getSavedQuotations();
  const filtered = currentList.filter(item => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete quotation from localStorage:', err);
  }
  return filtered;
}

export function generateNextQuotationNumber(existingNumber?: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const saved = getSavedQuotations();
  const pattern = new RegExp(`SPH/OAI/${year}/${month}/(\\d+)`, 'i');

  let highestSequence = 0;
  for (const quo of saved) {
    const match = quo.quotationNumber.match(pattern);
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
  return `SPH/OAI/${year}/${month}/${nextSeq}`;
}

export function convertQuotationToInvoiceData(quotation: QuotationData): InvoiceData {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const newInvoiceNumber = generateNextInvoiceNumber();

  let invoiceItems: LineItem[] = [];
  const options = quotation.options || [];
  const selectedOptionIds = quotation.selectedOptionIds || [];
  const selectedOptions = options.filter(opt => selectedOptionIds.includes(opt.id));

  if (selectedOptions.length > 0) {
    invoiceItems = selectedOptions.map(opt => ({
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      description: `${opt.category ? `${opt.category} - ` : ''}${opt.title}`,
      details: opt.description,
      qty: 1,
      price: opt.price,
    }));
  } else if (options.length > 0) {
    invoiceItems = [
      {
        id: `item_${Date.now()}_1`,
        description: `${options[0].category ? `${options[0].category} - ` : ''}${options[0].title}`,
        details: options[0].description,
        qty: 1,
        price: options[0].price,
      },
    ];
  } else {
    invoiceItems = (quotation.items || []).map(item => ({
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      description: item.description,
      details: item.details,
      qty: item.qty,
      price: item.price,
    }));
  }

  const calc = calculateQuotation(quotation);
  const totalAmount = invoiceItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const dpAmount = Math.round(totalAmount * 0.5);

  return {
    invoiceNumber: newInvoiceNumber,
    invoiceDate: today,
    dueDate: nextWeek,
    currency: quotation.currency || 'IDR',
    studio: { ...quotation.studio },
    client: { ...quotation.client },
    items: invoiceItems,
    discount: { enabled: false, type: 'fixed', value: 0 },
    tax: { ...quotation.tax },
    paymentScheme: 'dp_50',
    customDpAmount: dpAmount,
    paymentStatus: 'draft',
    dpReceivedDate: '',
    finalReceivedDate: '',
    paymentDetails: { ...quotation.paymentDetails },
    notes: `Invoice ini diterbitkan berdasarkan kesepakatan Surat Penawaran Harga No: ${quotation.quotationNumber} (${quotation.subject}).`,
    terms: [
      'Pembayaran DP sebesar 50% wajib dilakukan sebelum proses eksplorasi desain dimulai.',
      'Pelunasan sisa 50% dibayarkan setelah seluruh preview konsep desain disetujui, sebelum penyerahan Master File final.',
      'Hak cipta dan kepemilikan penuh aset desain beralih ke klien setelah pelunasan 100% terselesaikan.',
    ],
  };
}
