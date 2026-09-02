import { InvoiceData } from '../types';

export const INITIAL_INVOICE_DATA: InvoiceData = {
  invoiceNumber: 'INV/OAI/2026/09/001',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: 'IDR',
  studio: {
    name: 'otakatikide',
    tagline: 'Branding & Design Studio',
    email: 'otakatikide01@gmail.com',
    phone: '+62 812-3456-7890',
    portfolio: 'instagram.com/otakatikide',
    address: 'Jakarta Selatan, DKI Jakarta, Indonesia',
    logoText: 'otakatikide',
  },
  client: {
    name: 'Bpk. Hendra Pratama',
    company: 'Nusantara Coffee Roastery',
    whatsapp: '628123456789',
    email: 'hendra@nusantaracoffee.id',
    address: 'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan',
  },
  items: [
    {
      id: '1',
      description: 'Brand Identity & Logo Design System',
      details: '3 Konsep Logo Utama, Filosofi Desain, Primary & Secondary Logo, Color Palette & Typography Hierarchy, Master Vector Files (AI, SVG, PNG High-Res)',
      qty: 1,
      price: 3500000,
    },
    {
      id: '2',
      description: 'Comprehensive Brand Guidelines Book',
      details: 'Buku Panduan Standar Identitas Visual (PDF 25+ Halaman), Aturan Pemakaian Logo, Clear Space, Do & Don\'ts, Tone of Voice',
      qty: 1,
      price: 1800000,
    },
    {
      id: '3',
      description: 'Social Media Launching Kit & Packaging Collateral',
      details: '9 Template Post IG Feed, 5 IG Story, Desain Cup Packaging & Seal Label Sticker siap cetak',
      qty: 1,
      price: 1500000,
    },
  ],
  discount: {
    enabled: false,
    type: 'percentage',
    value: 10,
  },
  tax: {
    enabled: false,
    percentage: 11,
  },
  paymentScheme: 'dp_50',
  customDpAmount: 3400000,
  paymentStatus: 'draft',
  dpReceivedDate: '',
  finalReceivedDate: '',
  paymentDetails: {
    bankName: 'Bank BCA',
    bankAccount: '8720-9988-12',
    accountHolder: 'OTAKATIKIDE STUDIO',
    showQris: true,
    qrisImageUrl: '',
    qrisNotes: 'Scan QRIS untuk pembayaran instant dari semua E-Wallet & Mobile Banking',
  },
  notes: 'Terima kasih telah mempercayakan proyek branding bisnis Anda kepada otakatikide! Kami berkomitmen memberikan karya desain terbaik dengan standar kualitas tinggi.',
  terms: [
    'Pembayaran DP sebesar 50% wajib dilakukan sebelum proses eksplorasi desain dimulai.',
    'Pelunasan sisa 50% dibayarkan setelah seluruh preview konsep desain disetujui, sebelum penyerahan Master File final.',
    'Hak cipta dan kepemilikan penuh aset desain beralih ke klien setelah pelunasan 100% terselesaikan.',
  ],
};

export interface ServicePreset {
  title: string;
  description: string;
  price: number;
}

export const PRESET_SERVICES: ServicePreset[] = [
  {
    title: 'Brand Identity & Logo Design System',
    description: '3 Konsep Logo, Primary & Secondary Logo, Color Palette, Typography, Master File (AI, EPS, SVG, PNG)',
    price: 3500000,
  },
  {
    title: 'Brand Guidelines Book (Manual Standar)',
    description: 'Panduan PDF lengkap 25+ halaman: Logo rules, color codes (CMYK, RGB, HEX), typography, application showcase',
    price: 1800000,
  },
  {
    title: 'Social Media Content Kit (Feed & Story)',
    description: '12 Template Feed Instagram (Figma/Canva) + 6 Story Templates + Custom Highlight Icons',
    price: 1500000,
  },
  {
    title: 'Packaging & Label Design',
    description: 'Desain kemasan box/pouch, label botol, hangtag, dan mockup 3D realistis siap cetak (Dieline ready)',
    price: 2200000,
  },
  {
    title: 'Website UI/UX Design (Landing Page)',
    description: 'Wireframe, High-Fidelity UI Design responsif Desktop & Mobile, interactive prototype di Figma',
    price: 4500000,
  },
  {
    title: 'Stationery & Marketing Collateral',
    description: 'Kartu nama, amplop, kop surat (letterhead), map folder, ID card karyawan, dan invoice template',
    price: 1200000,
  },
];
