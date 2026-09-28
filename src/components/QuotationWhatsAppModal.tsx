import React, { useState } from 'react';
import {
  MessageSquare,
  Copy,
  ExternalLink,
  Check,
  X,
  Phone,
  Sparkles,
} from 'lucide-react';
import { QuotationData } from '../types';
import { calculateQuotation } from '../utils/quotationStorage';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface QuotationWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: QuotationData;
  onUpdateClientPhone: (phone: string) => void;
}

export const QuotationWhatsAppModal: React.FC<QuotationWhatsAppModalProps> = ({
  isOpen,
  onClose,
  quotation,
  onUpdateClientPhone,
}) => {
  const [copied, setCopied] = useState(false);
  const calc = calculateQuotation(quotation);

  if (!isOpen) return null;

  // Format clean WhatsApp number
  const formatPhoneForWa = (raw: string): string => {
    let cleaned = raw.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    return cleaned;
  };

  const clientPhone = quotation.client.whatsapp || '';
  const waTarget = formatPhoneForWa(clientPhone);

  let deliverablesText = '';
  if (quotation.options && quotation.options.length > 0) {
    if (calc.hasDeal) {
      deliverablesText = `📋 *Opsi Paket Disepakati (Deal):*\n` +
        calc.selectedOptions
          .map((opt) => `• *${opt.title}* (${opt.category}): ${formatRupiah(opt.price)}`)
          .join('\n') +
        `\n\n💰 *Total Investasi Proyek:* *${formatRupiah(calc.grandTotal)}*`;
    } else {
      deliverablesText = `📋 *Daftar Opsi Penawaran Tersedia:*\n` +
        quotation.options
          .map((opt) => `• *${opt.title}* (${opt.category}) - ${formatRupiah(opt.price)}`)
          .join('\n') +
        `\n\n💡 *Catatan:* Silakan pilih salah satu opsi di atas. Total biaya resmi akan difinalisasi setelah opsi disepakati bersama.`;
    }
  } else {
    deliverablesText = `📋 *Rincian Paket & Deliverables:*\n` +
      quotation.items
        .map((item) => `• *${item.description}* (Qty: ${item.qty}) - ${formatRupiah(item.price * item.qty)}`)
        .join('\n') +
      (calc.hasDeal ? `\n\n💰 *Total Investasi Proyek:* *${formatRupiah(calc.grandTotal)}*` : '');
  }

  const messageText = `Halo *${quotation.client.name || 'Bpk/Ibu'}*${quotation.client.company ? ` (${quotation.client.company})` : ''},
Salam hangat dari *${quotation.studio.name}* (Branding & Design Studio)! 👋

Menindaklanjuti rencana kerjasama pengembangan proyek Anda, bersama ini kami menyampaikan *Surat Penawaran Harga (SPH)* resmi dengan rincian sebagai berikut:

📄 *No. Surat:* ${quotation.quotationNumber}
🎯 *Perihal:* ${quotation.subject}
📅 *Masa Berlaku:* Hingga ${formatDateIndo(quotation.validUntilDate)}
⏱️ *Estimasi Timeline:* ${quotation.timeline}

${deliverablesText}

File dokumen PDF Surat Penawaran resmi kami lampirkan untuk dipelajari. Apabila ada hal yang ingin didiskusikan atau disesuaikan, kami siap berdiskusi lebih lanjut via WhatsApp ini atau sesi online call.

Terima kasih atas kesempatan dan kepercayaan Anda. Besar harapan kami dapat berkolaborasi bersama! 🚀

Salam kreatif,
*${quotation.studio.name}*
${quotation.studio.portfolio ? `Portfolio: ${quotation.studio.portfolio}` : ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    const url = waTarget ? `https://wa.me/${waTarget}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-800 flex items-center justify-center border border-emerald-500/30">
              <MessageSquare className="w-5 h-5 fill-emerald-800 text-emerald-800" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-neutral-950 font-display">
                Kirim Penawaran ke WhatsApp
              </h3>
              <p className="text-xs text-neutral-500">
                Pesan penawaran harga ramah & profesional khusus calon klien baru.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-950 p-1 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* WhatsApp Target Phone Input */}
        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-1.5 text-xs">
          <label className="font-bold text-neutral-700 flex items-center gap-1.5 uppercase text-[10px]">
            <Phone className="w-3 h-3 text-neutral-500" />
            Nomor WhatsApp Calon Klien:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={clientPhone}
              onChange={(e) => onUpdateClientPhone(e.target.value)}
              placeholder="08123456789 atau 628123456789"
              className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white font-mono font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950 text-xs"
            />
            {waTarget && (
              <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-100/60 px-2 py-1 rounded">
                +{waTarget}
              </span>
            )}
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="flex-1 overflow-y-auto bg-neutral-100/80 p-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
          {messageText}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-200">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-neutral-700" />
                <span>Salin Pesan</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Kirim via WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
