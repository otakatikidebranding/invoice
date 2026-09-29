import React from 'react';
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Clock,
  FileText,
  CreditCard,
  Building2,
  Info,
} from 'lucide-react';
import { QuotationData } from '../types';
import { calculateQuotation } from '../utils/quotationStorage';
import { formatDateIndo, formatRupiah } from '../utils/formatters';

interface QuotationPaperProps {
  quotation: QuotationData;
}

export const QuotationPaper: React.FC<QuotationPaperProps> = ({ quotation }) => {
  const calc = calculateQuotation(quotation);

  return (
    <div
      id="quotation-document"
      className="invoice-paper bg-white text-neutral-900 mx-auto w-full max-w-[800px] p-3.5 sm:p-5 shadow-xl border border-neutral-200 print-shadow-none print-m-0 rounded-xl print:rounded-none relative flex flex-col justify-between text-xs"
      style={{ boxSizing: 'border-box' }}
    >
      <div className="space-y-2 sm:space-y-2.5 print:space-y-2">
        {/* Header: Studio Branding & Title */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2.5 print:pb-2 border-b-2 border-neutral-900">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              {/* Geometric Brand Logo Mark */}
              <div className="w-9 h-9 bg-neutral-950 text-white rounded-lg flex items-center justify-center font-display font-black text-lg tracking-tighter shadow-xs border border-neutral-800 shrink-0">
                <span>oi</span>
                <span className="text-[#FFD400] font-black">.</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-neutral-950 font-display leading-tight">
                  {quotation.studio.name}
                </h1>
                <p className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                  {quotation.studio.tagline}
                </p>
              </div>
            </div>

            {/* Studio Contact Metadata */}
            <div className="pt-1 text-[10.5px] text-neutral-600 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-neutral-500 shrink-0" />
                <span className="truncate">{quotation.studio.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-neutral-500 shrink-0" />
                <span>{quotation.studio.phone}</span>
              </div>
              {quotation.studio.portfolio && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-neutral-500 shrink-0" />
                  <span className="truncate">{quotation.studio.portfolio}</span>
                </div>
              )}
              {quotation.studio.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                  <span className="truncate">{quotation.studio.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Document Title & Quotation Meta */}
          <div className="text-left sm:text-right space-y-1.5 shrink-0">
            <div className="space-y-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
                Project Proposal & Quotation
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight font-display leading-none">
                Penawaran
              </h2>
            </div>

            <div className="space-y-0.5 text-[11px] pt-0.5">
              <div className="flex sm:justify-end gap-1.5 text-neutral-600">
                <span className="font-medium text-neutral-500">No. Surat:</span>
                <span className="font-mono font-bold text-neutral-950">
                  {quotation.quotationNumber}
                </span>
              </div>
              <div className="flex sm:justify-end gap-1.5 text-neutral-600">
                <span className="font-medium text-neutral-500">Tanggal Terbit:</span>
                <span className="font-medium text-neutral-900">
                  {formatDateIndo(quotation.quotationDate)}
                </span>
              </div>
              <div className="flex sm:justify-end gap-1.5 text-neutral-600">
                <span className="font-medium text-neutral-500">Berlaku Hingga:</span>
                <span className="font-bold text-rose-700">
                  {formatDateIndo(quotation.validUntilDate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Client & Subject / Perihal Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 print:gap-1.5 items-stretch">
          {/* Client Info Card (6 cols) */}
          <div className="md:col-span-6 p-2.5 print:p-2 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1 flex flex-col justify-start">
            <span className="text-[9px] font-black uppercase tracking-wider text-neutral-500 block">
              Kepada Yth.
            </span>
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-neutral-950 leading-tight">
                {quotation.client.name || 'Nama Klien / PIC'}
              </h3>
              {quotation.client.company && (
                <p className="text-[11px] font-bold text-neutral-700 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-neutral-500 shrink-0" />
                  <span>{quotation.client.company}</span>
                </p>
              )}
              {quotation.client.address && (
                <p className="text-[10px] text-neutral-600 leading-tight">
                  {quotation.client.address}
                </p>
              )}
              <div className="flex flex-wrap gap-x-2 text-[10px] text-neutral-500 pt-0.5">
                {quotation.client.whatsapp && <span>WA: {quotation.client.whatsapp}</span>}
                {quotation.client.email && <span>Email: {quotation.client.email}</span>}
              </div>
            </div>
          </div>

          {/* Project Subject & Introduction (6 cols) */}
          <div className="md:col-span-6 p-2.5 print:p-2 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col justify-start space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-neutral-500 block">
              Perihal & Ruang Lingkup Proyek:
            </span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-950 font-display leading-snug">
              {quotation.subject || 'Penawaran Kerjasama Jasa Desain & Branding'}
            </h4>
            <p className="text-[10px] sm:text-[10.5px] text-neutral-600 leading-relaxed italic pt-0.5">
              &ldquo;{quotation.introduction}&rdquo;
            </p>
          </div>
        </div>

        {/* Lampiran Opsi-Opsi Penawaran Jasa */}
        {quotation.options && quotation.options.length > 0 ? (
          quotation.optionsLayout === 'table' ? (
            /* Model Tabel Klasik */
            <div className="border border-amber-200/70 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-950 text-white text-[10px] uppercase font-extrabold tracking-wider">
                    <th className="py-2.5 px-3 w-48 sm:w-56 bg-neutral-900 text-[#FFD400] border-r border-neutral-800">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FFD400]"></span>
                        Opsi & Paket Penawaran
                      </span>
                    </th>
                    <th className="py-2.5 px-3 border-r border-neutral-800">Keterangan Deliverables & Spesifikasi Pekerjaan</th>
                    <th className="py-2.5 px-3 w-28 sm:w-32 text-right">Harga Opsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200/60 text-[11px]">
                  {Array.from(
                    new Set((quotation.options || []).map((o) => o.category || 'Paket Layanan Penawaran'))
                  ).map((catName) => {
                    const catOptions = (quotation.options || []).filter(
                      (o) => (o.category || 'Paket Layanan Penawaran') === catName
                    );
                    return (
                      <React.Fragment key={catName}>
                        <tr className="bg-amber-100/50 border-t border-b border-amber-200/60">
                          <td colSpan={3} className="py-1.5 px-3">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#FFD400] border border-amber-500"></span>
                              {catName}
                            </span>
                          </td>
                        </tr>
                        {catOptions.map((opt, optIdx) => {
                          const isSelectedDeal = quotation.selectedOptionIds?.includes(opt.id);
                          return (
                            <tr
                              key={opt.id || optIdx}
                              className={`${
                                isSelectedDeal
                                  ? 'bg-amber-100/50 border-l-4 border-l-amber-500'
                                  : 'bg-amber-50/50'
                              } transition-colors`}
                            >
                              <td className="py-2.5 px-3 align-top space-y-1 border-r border-amber-200/60">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-neutral-950 text-[11px] leading-snug">
                                    {opt.title}
                                  </span>
                                  {isSelectedDeal && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider bg-amber-500 text-neutral-950 shadow-2xs">
                                      ✓ Pilihan Deal
                                    </span>
                                  )}
                                </div>
                                {opt.timeline && (
                                  <p className="text-[9.5px] text-amber-900/80 font-medium flex items-center gap-1 pt-0.5">
                                    <Clock className="w-2.5 h-2.5 text-amber-700" />
                                    <span>{opt.timeline}</span>
                                  </p>
                                )}
                              </td>

                              <td className="py-2.5 px-3 align-top border-r border-amber-200/60">
                                <p className="text-[10px] sm:text-[10.5px] text-neutral-800 leading-relaxed whitespace-pre-line font-normal">
                                  {opt.description}
                                </p>
                              </td>

                              <td className="py-2.5 px-3 text-right font-mono font-bold align-top">
                                <span
                                  className={`text-[11.5px] sm:text-[12px] ${
                                    isSelectedDeal ? 'text-amber-950 font-black' : 'text-neutral-900'
                                  }`}
                                >
                                  {formatRupiah(opt.price)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Model Kartu Pricing Modern (3 Kotak Kolom Kompak - Sesuai Ukuran A4) */
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5 font-display">
                  <span className="w-2 h-2 rounded-full bg-[#FFD400]"></span>
                  Opsi & Paket Penawaran
                </span>
                <span className="text-[8.5px] font-medium text-neutral-500">
                  Pilih paket sesuai kebutuhan bisnis Anda
                </span>
              </div>

              {/* Tepat 3 Kolom Kompak, Rapat, Tidak Membuang Ruang A4 */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 items-stretch pt-1">
                {(quotation.options || []).slice(0, 3).map((opt, optIdx) => {
                  const isSelectedDeal = quotation.selectedOptionIds?.includes(opt.id);
                  const isPopular =
                    opt.isPopular ?? (!quotation.options?.some((o) => o.isPopular) && optIdx === 1);

                  // Parsing baris deskripsi menjadi item checklist
                  const rawLines = (opt.description || '')
                    .split('\n')
                    .map((l) => l.trim())
                    .filter(Boolean);
                  const checklist = rawLines.map((line) =>
                    line.replace(/^[\s•\-\*✓✔]+\s*/, '')
                  );

                  // WhatsApp inquiry link
                  const cleanPhone = (quotation.studio.phone || '').replace(/[^0-9]/g, '');
                  const waUrl = cleanPhone
                    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `Halo ${quotation.studio.name}, saya ingin pesan ${opt.title} (${formatRupiah(
                          opt.price
                        )}) dari Penawaran ${quotation.quotationNumber}`
                      )}`
                    : '#';

                  return (
                    <div
                      key={opt.id || optIdx}
                      className={`rounded-xl p-2.5 sm:p-3 flex flex-col justify-between relative transition-all duration-150 ${
                        isSelectedDeal || isPopular
                          ? 'bg-amber-100/70 border-2 border-amber-400 shadow-xs ring-1 ring-amber-400/40 text-neutral-950'
                          : 'bg-amber-50/60 border border-amber-200/90 text-neutral-900'
                      }`}
                    >
                      {/* Top Pill Badge: PALING DIMINATI atau OPSI DEAL */}
                      {(isSelectedDeal || isPopular) && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-neutral-950 text-[#FFD400] border border-[#FFD400] text-[7.5px] sm:text-[8px] font-black tracking-wider uppercase flex items-center gap-0.5 shadow-2xs">
                            {isSelectedDeal ? '✓ PILIHAN DEAL' : 'PALING DIMINATI ⭐'}
                          </span>
                        </div>
                      )}

                      {/* Header Kartu: Judul, Subtitle, & Harga */}
                      <div className="space-y-1.5">
                        <div>
                          <h4 className="text-xs sm:text-[13px] font-black text-neutral-950 tracking-tight leading-snug">
                            {opt.title}
                          </h4>
                          {opt.subtitle ? (
                            <p className="text-[7.5px] sm:text-[8px] text-neutral-600 font-medium leading-tight pt-0.5 line-clamp-2">
                              {opt.subtitle}
                            </p>
                          ) : opt.category ? (
                            <p className="text-[7.5px] uppercase tracking-wider text-amber-900/80 font-bold pt-0.5">
                              {opt.category}
                            </p>
                          ) : null}
                        </div>

                        {/* Nominal Harga Opsi */}
                        <div className="pt-0.5">
                          <span
                            className={`font-mono text-sm sm:text-base font-black tracking-tight ${
                              isSelectedDeal || isPopular ? 'text-amber-950' : 'text-neutral-900'
                            }`}
                          >
                            {formatRupiah(opt.price)}
                          </span>
                        </div>

                        {/* Daftar Rincian Deliverables dengan Centang Kuning */}
                        <div className="pt-1 border-t border-amber-200/80">
                          <ul className="space-y-1 text-[8px] sm:text-[8.5px] text-neutral-700 font-normal leading-tight">
                            {checklist.map((item, itemIdx) => (
                              <li key={itemIdx} className="flex items-start gap-1 leading-tight">
                                <span className="text-amber-600 font-black shrink-0 text-[9px] leading-none mt-0.5">
                                  ✓
                                </span>
                                <span className="leading-tight">{item}</span>
                              </li>
                            ))}
                            {opt.timeline &&
                              !checklist.some((c) => c.toLowerCase().includes('hari kerja')) && (
                                <li className="flex items-start gap-1 leading-tight text-neutral-700">
                                  <span className="text-amber-600 font-black shrink-0 text-[9px] leading-none mt-0.5">
                                    ✓
                                  </span>
                                  <span className="leading-tight">Pengerjaan {opt.timeline}</span>
                                </li>
                              )}
                          </ul>
                        </div>
                      </div>

                      {/* Tombol Aksi / Pesan di Bagian Bawah */}
                      <div className="pt-2 mt-1.5">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`w-full py-1 sm:py-1.5 px-1.5 rounded-lg text-[8px] sm:text-[8.5px] font-black tracking-wider uppercase flex items-center justify-center gap-1 text-center transition cursor-pointer leading-tight ${
                            isSelectedDeal || isPopular
                              ? 'bg-neutral-950 text-[#FFD400] hover:bg-neutral-800 shadow-2xs'
                              : 'bg-white/95 border border-amber-300 text-neutral-900 hover:bg-amber-100/80 shadow-2xs'
                          }`}
                        >
                          <span className="truncate">{opt.ctaText || 'Pesan & Tanya Info Opsi Lain'}</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          /* Deliverables / Scope of Work Table Fallback */
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-950 text-white text-[10px] uppercase font-extrabold tracking-wider">
                  <th className="py-2 px-2.5 w-8 text-center">No</th>
                  <th className="py-2 px-3">Ruang Lingkup & Spesifikasi Pekerjaan</th>
                  <th className="py-2 px-2.5 w-14 text-center">Qty</th>
                  <th className="py-2 px-3 w-28 text-right">Harga Satuan</th>
                  <th className="py-2 px-3 w-28 text-right">Total Investasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-[11px]">
                {quotation.items.map((item, idx) => {
                  const itemTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);
                  return (
                    <tr
                      key={item.id || idx}
                      className={idx % 2 === 1 ? 'bg-neutral-50/70' : 'bg-white'}
                    >
                      <td className="py-2 px-2.5 text-center font-mono text-neutral-500 align-top">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 align-top space-y-0.5">
                        <p className="font-bold text-neutral-950">{item.description}</p>
                        {item.details && (
                          <p className="text-[10px] text-neutral-600 leading-relaxed">
                            {item.details}
                          </p>
                        )}
                      </td>
                      <td className="py-2 px-2.5 text-center font-mono text-neutral-700 align-top">
                        {item.qty}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-neutral-700 align-top">
                        {formatRupiah(item.price)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-neutral-950 align-top">
                        {formatRupiah(itemTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Project Terms, Summary & Official Endorsement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 print:gap-2 items-start">
          {/* Left Column (7 cols): Timeline, Payment Terms, & Syarat Ketentuan */}
          <div className="md:col-span-7 space-y-2">
            {/* Timeline & Payment Schedule side-by-side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2 sm:p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5 mb-1">
                  <Clock className="w-3 h-3 text-neutral-700" />
                  Estimasi Timeline
                </span>
                <p className="text-[10px] sm:text-[10.5px] text-neutral-800 font-semibold leading-snug">
                  {quotation.timeline}
                </p>
              </div>

              <div className="p-2 sm:p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5 mb-1">
                  <CreditCard className="w-3 h-3 text-neutral-700" />
                  Tahapan Pembayaran
                </span>
                <p className="text-[10px] sm:text-[10.5px] text-neutral-700 leading-snug whitespace-pre-line">
                  {quotation.paymentTerms}
                </p>
              </div>
            </div>

            {/* Syarat & Ketentuan Penawaran */}
            {quotation.terms && quotation.terms.length > 0 && (
              <div className="p-2.5 bg-neutral-50/70 rounded-lg border border-neutral-200 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-neutral-600" />
                  Syarat & Ketentuan Penawaran:
                </span>
                <ol className="list-decimal list-inside text-[9.5px] text-neutral-600 space-y-0.5 leading-snug pl-0.5">
                  {quotation.terms.map((term, i) => (
                    <li key={i}>{term}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Ringkasan Investasi & Pengesahan Studio */}
          <div className="md:col-span-5 space-y-2">
            {/* Total Investasi Proyek (HANYA MUNCUL JIKA SUDAH ADA DEAL DARI KLIEN) */}
            {calc.hasDeal ? (
              <div className="p-2.5 sm:p-3 bg-neutral-950 text-white rounded-lg shadow-xs space-y-2">
                <div className="flex justify-between items-center pb-1.5 border-b border-neutral-800">
                  <span className="font-display uppercase tracking-wider text-[10px] font-bold text-neutral-300">
                    Total Investasi (Opsi Deal)
                  </span>
                  <span className="text-[8.5px] font-bold uppercase tracking-wider bg-amber-400/20 text-[#FFD400] border border-amber-500/50 px-1.5 py-0.5 rounded">
                    ✓ {calc.selectedOptions.length} Opsi Disepakati
                  </span>
                </div>

                {/* Rincian opsi yang disepakati */}
                <div className="space-y-1 text-[9.5px] text-neutral-300">
                  {calc.selectedOptions.map((opt) => (
                    <div key={opt.id} className="flex justify-between items-center text-neutral-300">
                      <span className="truncate pr-2 font-medium">• {opt.title}</span>
                      <span className="font-mono text-neutral-200 shrink-0">{formatRupiah(opt.price)}</span>
                    </div>
                  ))}
                </div>

                {quotation.tax?.enabled && (
                  <div className="pt-1 border-t border-neutral-800/80 flex justify-between text-[9.5px] text-neutral-400">
                    <span>PPN ({quotation.tax.percentage}%):</span>
                    <span className="font-mono text-neutral-300">+{formatRupiah(calc.taxAmount)}</span>
                  </div>
                )}

                <div className="pt-1.5 border-t border-neutral-800 flex justify-between items-baseline">
                  <span className="text-[10px] text-neutral-400 font-medium">Nilai Total:</span>
                  <span className="font-mono text-lg sm:text-xl text-[#FFD400] font-black">
                    {formatRupiah(calc.grandTotal)}
                  </span>
                </div>
              </div>
            ) : (
              /* Saat belum deal: Total Biaya Dihapus / Disembunyikan, diganti info status terstruktur yang mengisi rapi */
              <div className="p-2.5 sm:p-3 bg-neutral-50 rounded-lg border border-dashed border-neutral-300 space-y-1.5">
                <div className="flex items-center gap-1.5 text-neutral-900">
                  <Info className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                  <span className="text-[9.5px] font-black uppercase tracking-wider">
                    Status: Penawaran Opsi Terbuka
                  </span>
                </div>
                <p className="text-[9.5px] text-neutral-600 leading-relaxed">
                  Total biaya resmi akan difinalisasi dan diterbitkan dalam Invoice Tagihan setelah opsi disepakati oleh klien.
                </p>
                <div className="pt-1 border-t border-neutral-200/80 text-[9px] text-neutral-500 font-medium">
                  Konfirmasi pilihan paket: <span className="font-semibold text-neutral-800">{quotation.studio.phone || quotation.studio.email}</span>
                </div>
              </div>
            )}

            {/* Studio Issuer Box (Diajukan Oleh) - Compact & Tepat di bawah status box (tanpa gap kosong) */}
            <div className="p-2 sm:p-2.5 rounded-lg border border-neutral-200 bg-neutral-50/90 flex flex-col justify-center gap-1">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-700">
                  Diajukan Oleh:
                </span>
                <span className="text-[8.5px] text-neutral-500 font-medium">
                  {formatDateIndo(quotation.quotationDate)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-0.5 border-t border-neutral-200/80">
                <p className="font-display font-black text-neutral-950 text-xs">
                  {quotation.studio.name}
                </p>
                <p className="text-[9px] text-neutral-500 font-medium">
                  Creative & Project Lead
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="pt-2 print:pt-1 border-t border-neutral-200 mt-2 print:mt-1 flex justify-between items-center text-[9px] text-neutral-500">
        <span>{quotation.studio.name} • {quotation.studio.tagline}</span>
        <span className="font-mono text-neutral-400">Dokumen Penawaran Resmi • ID: {quotation.quotationNumber}</span>
      </div>
    </div>
  );
};
