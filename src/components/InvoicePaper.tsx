import React from 'react';
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  Calendar,
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  FileCheck,
} from 'lucide-react';
import { InvoiceData } from '../types';
import { calculateInvoice, formatDateIndo, formatRupiah } from '../utils/formatters';

interface InvoicePaperProps {
  invoice: InvoiceData;
  scale?: number;
}

export const InvoicePaper: React.FC<InvoicePaperProps> = ({ invoice }) => {
  const calc = calculateInvoice(invoice);

  const getStatusBadge = () => {
    switch (invoice.paymentStatus) {
      case 'paid':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-[#FFD400] text-neutral-950 border border-[#E6BE00] shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            LUNAS (FULLY PAID)
          </div>
        );
      case 'dp_paid':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-neutral-900 text-[#FFD400] border border-neutral-800 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-[#FFD400]" />
            {invoice.paymentScheme === 'dp_custom'
              ? `DP SUDAH DIBAYAR (${formatRupiah(calc.dpAmount)})`
              : 'DP 50% SUDAH DIBAYAR'}
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-neutral-100 text-neutral-700 border border-neutral-300">
            <FileCheck className="w-3.5 h-3.5" />
            DRAFT / MENUNGGU PEMBAYARAN
          </div>
        );
    }
  };

  return (
    <div
      id="invoice-document"
      className="bg-white text-neutral-900 mx-auto w-full max-w-[800px] min-h-[1130px] p-8 md:p-12 shadow-xl border border-neutral-200 print-shadow-none print-m-0 rounded-xl print:rounded-none relative flex flex-col justify-between"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Top Section */}
      <div>
        {/* Header: Studio Branding & Title */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b-2 border-neutral-900">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {/* Geometric Brand Logo Mark */}
              <div className="w-12 h-12 bg-neutral-950 text-white rounded-xl flex items-center justify-center font-display font-black text-xl tracking-tighter shadow-xs border border-neutral-800">
                <span>oi</span>
                <span className="text-[#FFD400] font-black">.</span>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-neutral-950 font-display">
                  {invoice.studio.name}
                </h1>
                <p className="text-xs font-bold tracking-widest text-neutral-500 uppercase">
                  {invoice.studio.tagline}
                </p>
              </div>
            </div>

            {/* Studio Contact Metadata */}
            <div className="pt-2 text-xs text-neutral-600 space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span>{invoice.studio.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-neutral-500" />
                <span>{invoice.studio.phone}</span>
              </div>
              {invoice.studio.portfolio && (
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{invoice.studio.portfolio}</span>
                </div>
              )}
              {invoice.studio.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{invoice.studio.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Document Title & Invoice Meta */}
          <div className="text-left sm:text-right space-y-2.5">
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Dokumen Resmi
              </span>
              <h2 className="text-3xl font-black text-neutral-950 tracking-tight font-display">
                INVOICE
              </h2>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex sm:justify-end gap-2 text-neutral-600">
                <span className="font-medium text-neutral-500">No. Invoice:</span>
                <span className="font-bold text-neutral-950 font-mono">
                  {invoice.invoiceNumber || 'INV/OAI/2026/001'}
                </span>
              </div>
              <div className="flex sm:justify-end gap-2 text-neutral-600">
                <span className="font-medium text-neutral-500">Tanggal:</span>
                <span className="font-semibold text-neutral-900">
                  {formatDateIndo(invoice.invoiceDate)}
                </span>
              </div>
              <div className="flex sm:justify-end gap-2 text-neutral-600">
                <span className="font-medium text-neutral-500">Jatuh Tempo:</span>
                <span className="font-bold text-neutral-950">
                  {formatDateIndo(invoice.dueDate)}
                </span>
              </div>
            </div>

            <div className="pt-1 flex sm:justify-end">{getStatusBadge()}</div>
          </div>
        </div>

        {/* Client & Billing Info Section */}
        <div className="py-6 border-b border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80">
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500 flex items-center gap-1.5 mb-2">
              <Building2 className="w-3 h-3 text-neutral-600" />
              Ditujukan Kepada (Klien):
            </span>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-neutral-950 leading-tight">
                {invoice.client.name || 'Nama Klien'}
              </h3>
              {invoice.client.company && (
                <p className="text-xs font-semibold text-neutral-700">
                  {invoice.client.company}
                </p>
              )}
              {invoice.client.whatsapp && (
                <p className="text-xs text-neutral-600 flex items-center gap-1">
                  <span className="text-neutral-500">WhatsApp:</span>
                  <span className="font-mono">{invoice.client.whatsapp}</span>
                </p>
              )}
              {invoice.client.email && (
                <p className="text-xs text-neutral-600">
                  <span className="text-neutral-500">Email:</span> {invoice.client.email}
                </p>
              )}
              {invoice.client.address && (
                <p className="text-xs text-neutral-600 pt-1 leading-relaxed">
                  {invoice.client.address}
                </p>
              )}
            </div>
          </div>

          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500 flex items-center gap-1.5 mb-2">
                <Calendar className="w-3 h-3 text-neutral-600" />
                Ketentuan Pembayaran Proyek:
              </span>
              <div className="space-y-1.5 text-xs text-neutral-700">
                <div className="flex justify-between items-center py-0.5 border-b border-neutral-200/60">
                  <span className="text-neutral-600">Sistem Pembayaran:</span>
                  <span className="font-bold text-neutral-900">
                    {invoice.paymentScheme === 'dp_50' ? 'Sistem DP 50% & Pelunasan' : 'Full Payment (100%)'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-neutral-200/60">
                  <span className="text-neutral-600">Mata Uang:</span>
                  <span className="font-bold text-neutral-900 font-mono">IDR (Rupiah)</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-neutral-600">Batas Waktu:</span>
                  <span className="font-bold text-neutral-900">{formatDateIndo(invoice.dueDate)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-neutral-500 italic">
              *Master file dan hak cipta diserahkan penuh setelah pelunasan 100%.
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-neutral-900 text-[11px] font-bold tracking-wider uppercase text-neutral-700 bg-neutral-100/70">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3">Deskripsi Layanan & Spesifikasi</th>
                <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                <th className="py-2.5 px-3 w-32 text-right">Harga Satuan</th>
                <th className="py-2.5 px-3 w-36 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-xs">
              {invoice.items.map((item, index) => {
                const totalItem = (Number(item.qty) || 0) * (Number(item.price) || 0);
                return (
                  <tr key={item.id || index} className="hover:bg-neutral-50/50 transition">
                    <td className="py-3 px-3 text-center font-mono text-neutral-500 align-top">
                      {index + 1}
                    </td>
                    <td className="py-3 px-3 align-top space-y-1">
                      <p className="font-bold text-neutral-950 text-sm">{item.description}</p>
                      {item.details && (
                        <p className="text-[11px] text-neutral-600 leading-relaxed">
                          {item.details}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-neutral-800 align-top">
                      {item.qty}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-neutral-800 align-top">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-neutral-950 align-top">
                      {formatRupiah(totalItem)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculation & Summary Area */}
        <div className="py-4 border-t border-neutral-300 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Payment Scheme Breakdown Box */}
          <div className="md:col-span-6 space-y-3">
            <div className="bg-neutral-950 text-neutral-100 p-4 rounded-xl shadow-xs border border-neutral-900">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Rincian Skema Pembayaran
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#FFD400] text-neutral-950">
                  {invoice.paymentScheme === 'dp_50'
                    ? 'SISTEM DP 50%'
                    : invoice.paymentScheme === 'dp_custom'
                    ? `DP NOMINAL KHUSUS (${calc.dpPercentage.toFixed(0)}%)`
                    : 'FULL PAYMENT'}
                </span>
              </div>

              {invoice.paymentScheme === 'dp_50' || invoice.paymentScheme === 'dp_custom' ? (
                <div className="pt-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300 flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#FFD400]"></span>
                      {invoice.paymentScheme === 'dp_custom' ? 'Nominal DP (Manual):' : 'Nominal DP 50% (Awal):'}
                    </span>
                    <span className="font-mono font-black text-base text-[#FFD400]">
                      {formatRupiah(calc.dpAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
                      Sisa Tagihan (Pelunasan):
                    </span>
                    <span className="font-mono font-bold text-neutral-200">
                      {formatRupiah(calc.remainingAmount)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400">
                    {invoice.paymentStatus === 'dp_paid' ? (
                      <span className="text-[#FFD400] font-bold">
                        ✓ DP ({formatRupiah(calc.dpAmount)}) telah lunas. Tagihan saat ini: Sisa Pelunasan {formatRupiah(calc.remainingAmount)}
                      </span>
                    ) : (
                      <span>
                        *Pekerjaan dimulai setelah transfer DP ({formatRupiah(calc.dpAmount)}) diterima.
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pt-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300">Total Pelunasan 100%:</span>
                    <span className="font-mono font-black text-lg text-[#FFD400]">
                      {formatRupiah(calc.grandTotal)}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 pt-1">
                    Pembayaran dilakukan penuh 100% sebelum serah terima final project.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Subtotal, Discount, Tax, Grand Total Table */}
          <div className="md:col-span-6 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-neutral-200 text-neutral-600">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold text-neutral-900">
                {formatRupiah(calc.subtotal)}
              </span>
            </div>

            {invoice.discount.enabled && (
              <div className="flex justify-between py-1 border-b border-neutral-200 text-neutral-900 font-semibold">
                <span>
                  Diskon {invoice.discount.type === 'percentage' ? `(${invoice.discount.value}%)` : ''}:
                </span>
                <span className="font-mono font-bold text-neutral-950">
                  - {formatRupiah(calc.discountAmount)}
                </span>
              </div>
            )}

            {invoice.tax.enabled && (
              <div className="flex justify-between py-1 border-b border-neutral-200 text-neutral-600">
                <span>PPN ({invoice.tax.percentage}%):</span>
                <span className="font-mono font-semibold text-neutral-900">
                  + {formatRupiah(calc.taxAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-2.5 border-b-2 border-neutral-950 text-neutral-950 font-bold text-sm">
              <span className="font-display uppercase tracking-wide">Total Tagihan:</span>
              <span className="font-mono text-xl text-neutral-950 font-black">
                {formatRupiah(calc.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods Section (Bank BCA & QRIS) */}
        <div className="py-5 border-t border-neutral-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-neutral-700" />
            Instruksi Pembayaran Resmi (Payment Details)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bank BCA Card */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-950 bg-[#FFD400] px-2.5 py-0.5 rounded border border-[#E6BE00]">
                  {invoice.paymentDetails.bankName || 'Bank BCA'}
                </span>
                <span className="text-[10px] text-neutral-500 font-semibold uppercase">Transfer Bank</span>
              </div>
              <div className="pt-1">
                <span className="text-[10px] text-neutral-500 uppercase font-bold">
                  Nomor Rekening:
                </span>
                <p className="font-mono text-lg font-black text-neutral-950 tracking-wider">
                  {invoice.paymentDetails.bankAccount || '8720-9988-12'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                  Atas Nama:
                </span>
                <p className="text-xs font-bold text-neutral-800">
                  {invoice.paymentDetails.accountHolder || 'OTAKATIKIDE STUDIO'}
                </p>
              </div>
            </div>

            {/* QRIS Card */}
            {invoice.paymentDetails.showQris && (
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-4">
                <div className="w-20 h-20 bg-white p-1 rounded-lg border border-neutral-300 flex items-center justify-center shrink-0 shadow-2xs">
                  {invoice.paymentDetails.qrisImageUrl ? (
                    <img
                      src={invoice.paymentDetails.qrisImageUrl}
                      alt="QRIS otakatikide"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    /* Elegant SVG Fallback QRIS Preview */
                    <div className="w-full h-full bg-neutral-950 text-white rounded p-1 flex flex-col items-center justify-center">
                      <QrCode className="w-10 h-10 text-[#FFD400]" />
                      <span className="text-[7px] font-black tracking-tighter text-white">QRIS RESMI</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 bg-neutral-200 px-2 py-0.5 rounded border border-neutral-300 inline-block">
                    QRIS Universal
                  </span>
                  <p className="text-[11px] text-neutral-700 font-medium leading-snug">
                    {invoice.paymentDetails.qrisNotes || 'Mendukung BCA Mobile, Livin, GoPay, OVO, ShopeePay, DANA & Semua E-Wallet'}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    Scan langsung menggunakan aplikasi m-Banking/e-wallet Anda.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes & Terms Section */}
        <div className="py-4 border-t border-neutral-200 space-y-3">
          {invoice.notes && (
            <div className="text-xs bg-neutral-100/60 p-3 rounded-lg border border-neutral-200">
              <span className="font-bold text-neutral-800">Catatan Khusus:</span>
              <p className="text-neutral-700 mt-0.5 leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          {invoice.terms && invoice.terms.length > 0 && (
            <div className="space-y-1 text-[11px] text-neutral-600">
              <span className="font-bold uppercase tracking-wider text-neutral-700 text-[10px]">
                Syarat & Ketentuan (Terms & Conditions):
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-600 pl-1 leading-relaxed">
                {invoice.terms.map((term, i) => (
                  <li key={i}>{term}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Signature / Brand Tag */}
      <div className="pt-8 border-t border-neutral-300 mt-6 flex flex-col sm:flex-row justify-between items-end gap-4 text-xs text-neutral-500">
        <div>
          <p className="font-display font-bold text-neutral-900 text-sm">
            {invoice.studio.name}
          </p>
          <p className="text-[11px] text-neutral-500">
            {invoice.studio.tagline} • Crafted with precision & creative excellence.
          </p>
        </div>

        <div className="text-left sm:text-right space-y-1">
          <p className="text-[11px] text-neutral-500">
            Diterbitkan oleh Manajemen {invoice.studio.name}
          </p>
          <div className="font-mono text-[10px] text-neutral-400">
            Dokumen sah tanpa tanda tangan basah • ID: {invoice.invoiceNumber}
          </div>
        </div>
      </div>
    </div>
  );
};
