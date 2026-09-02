import { InvoiceData } from '../types';

export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    }
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function cleanWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  } else if (cleaned.startsWith('+62')) {
    cleaned = '62' + cleaned.substring(3);
  }
  return cleaned;
}

export interface InvoiceCalculations {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  dpAmount: number;
  remainingAmount: number;
  activePayableAmount: number;
  dpPercentage: number;
}

export function calculateInvoice(invoice: InvoiceData): InvoiceCalculations {
  const subtotal = invoice.items.reduce((acc, item) => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    return acc + qty * price;
  }, 0);

  let discountAmount = 0;
  if (invoice.discount.enabled) {
    if (invoice.discount.type === 'percentage') {
      discountAmount = (subtotal * (invoice.discount.value || 0)) / 100;
    } else {
      discountAmount = invoice.discount.value || 0;
    }
  }

  const taxableBase = Math.max(0, subtotal - discountAmount);

  let taxAmount = 0;
  if (invoice.tax.enabled) {
    taxAmount = (taxableBase * (invoice.tax.percentage || 0)) / 100;
  }

  const grandTotal = taxableBase + taxAmount;

  let dpAmount = 0;
  let remainingAmount = 0;

  if (invoice.paymentScheme === 'dp_50') {
    dpAmount = Math.round(grandTotal * 0.5);
    remainingAmount = Math.max(0, grandTotal - dpAmount);
  } else if (invoice.paymentScheme === 'dp_custom') {
    const customDp =
      typeof invoice.customDpAmount === 'number' && invoice.customDpAmount >= 0
        ? invoice.customDpAmount
        : Math.round(grandTotal * 0.5);
    dpAmount = Math.min(grandTotal, customDp);
    remainingAmount = Math.max(0, grandTotal - dpAmount);
  } else {
    // Full payment
    dpAmount = grandTotal;
    remainingAmount = 0;
  }

  const dpPercentage = grandTotal > 0 ? (dpAmount / grandTotal) * 100 : 0;

  const isDpScheme = invoice.paymentScheme === 'dp_50' || invoice.paymentScheme === 'dp_custom';
  const activePayableAmount = isDpScheme
    ? invoice.paymentStatus === 'dp_paid'
      ? remainingAmount
      : dpAmount
    : grandTotal;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    grandTotal,
    dpAmount,
    remainingAmount,
    activePayableAmount,
    dpPercentage,
  };
}

export function generateWhatsAppMessage(invoice: InvoiceData): string {
  const calc = calculateInvoice(invoice);
  const clientName = invoice.client.name || 'Klien';
  const clientCompany = invoice.client.company ? ` (${invoice.client.company})` : '';
  const invNo = invoice.invoiceNumber || 'INV-001';
  const dueDate = formatDateIndo(invoice.dueDate);

  let schemeText = '';
  const dpDateStr = invoice.dpReceivedDate ? ` (Diterima: ${formatDateIndo(invoice.dpReceivedDate)})` : '';
  const finalDateStr = invoice.finalReceivedDate ? ` (Lunas: ${formatDateIndo(invoice.finalReceivedDate)})` : '';

  if (invoice.paymentScheme === 'dp_50') {
    if (invoice.paymentStatus === 'dp_paid') {
      schemeText = `*Tagihan Pelunasan (50%):* ${formatRupiah(calc.remainingAmount)}\n*Status DP 50%:* Sudah Diterima ${formatRupiah(calc.dpAmount)}${dpDateStr}`;
    } else if (invoice.paymentStatus === 'paid') {
      schemeText = `*Status Pembayaran:* LUNAS 100% (Fully Paid)${finalDateStr}${dpDateStr ? `\n*Riwayat DP:* Telah diterima ${formatRupiah(calc.dpAmount)}${dpDateStr}` : ''}`;
    } else {
      schemeText = `*Skema:* DP 50% (${formatRupiah(calc.dpAmount)}) | *Sisa Pelunasan:* ${formatRupiah(calc.remainingAmount)}`;
    }
  } else if (invoice.paymentScheme === 'dp_custom') {
    if (invoice.paymentStatus === 'dp_paid') {
      schemeText = `*Tagihan Pelunasan:* ${formatRupiah(calc.remainingAmount)}\n*Status DP:* Nominal Khusus ${formatRupiah(calc.dpAmount)} Sudah Diterima${dpDateStr}`;
    } else if (invoice.paymentStatus === 'paid') {
      schemeText = `*Status Pembayaran:* LUNAS 100% (Fully Paid)${finalDateStr}${dpDateStr ? `\n*Riwayat DP:* Telah diterima ${formatRupiah(calc.dpAmount)}${dpDateStr}` : ''}`;
    } else {
      schemeText = `*Skema:* DP Nominal Khusus (${formatRupiah(calc.dpAmount)}) | *Sisa Tagihan (Pelunasan):* ${formatRupiah(calc.remainingAmount)}`;
    }
  } else {
    if (invoice.paymentStatus === 'paid') {
      schemeText = `*Status Pembayaran:* LUNAS 100% (${formatRupiah(calc.grandTotal)})${finalDateStr}`;
    } else {
      schemeText = `*Skema:* Pembayaran Penuh (Full Payment) - ${formatRupiah(calc.grandTotal)}`;
    }
  }

  const itemSummary = invoice.items
    .map((item, idx) => `  ${idx + 1}. ${item.description} (x${item.qty}) - ${formatRupiah(item.qty * item.price)}`)
    .join('\n');

  const text = `Halo ${clientName}${clientCompany},

Berikut adalah detail tagihan Invoice resmi dari *${invoice.studio.name}* (${invoice.studio.tagline}):

📄 *No. Invoice:* ${invNo}
📅 *Tanggal Jatuh Tempo:* ${dueDate}

📋 *Rincian Layanan:*
${itemSummary}

💰 *Total Keseluruhan:* ${formatRupiah(calc.grandTotal)}
${schemeText}

💳 *Metode Pembayaran (Transfer Bank):*
• *Bank:* ${invoice.paymentDetails.bankName}
• *No. Rekening:* ${invoice.paymentDetails.bankAccount}
• *Atas Nama:* ${invoice.paymentDetails.accountHolder}

📌 _Catatan: Dokumen Invoice versi PDF resmi telah terlampir / dapat diunduh. Mohon kirimkan bukti transfer setelah melakukan pembayaran._

Terima kasih atas kerja samanya! ✨
*${invoice.studio.name}*
${invoice.studio.phone} | ${invoice.studio.email}
${invoice.studio.portfolio ? `Portfolio: ${invoice.studio.portfolio}` : ''}`;

  return text;
}
