import React, { useState } from 'react';
import { MessageSquare, Copy, Check, ExternalLink, X, Smartphone } from 'lucide-react';
import { InvoiceData } from '../types';
import { cleanWhatsAppNumber, generateWhatsAppMessage } from '../utils/formatters';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData;
  onUpdateClientPhone: (phone: string) => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onUpdateClientPhone,
}) => {
  const [copied, setCopied] = useState(false);
  const [clientPhone, setClientPhone] = useState(invoice.client.whatsapp || '');

  if (!isOpen) return null;

  const rawCleanPhone = cleanWhatsAppNumber(clientPhone);
  const messageText = generateWhatsAppMessage({
    ...invoice,
    client: { ...invoice.client, whatsapp: clientPhone },
  });
  const encodedMessage = encodeURIComponent(messageText);
  const waUrl = rawCleanPhone ? `https://wa.me/${rawCleanPhone}?text=${encodedMessage}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setClientPhone(val);
    onUpdateClientPhone(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs no-print">
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]"
        id="whatsapp-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD400] text-neutral-950 flex items-center justify-center font-bold shadow-xs">
              <MessageSquare className="w-5 h-5 fill-neutral-950" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Kirim Pesan WhatsApp</h3>
              <p className="text-xs text-neutral-400">
                Pesan tagihan terformat otomatis untuk dikirimkan langsung ke klien
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Client phone field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-neutral-950" />
              Nomor WhatsApp Klien
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={clientPhone}
                  onChange={handlePhoneChange}
                  placeholder="Contoh: 628123456789 atau 08123456789"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10 text-sm font-mono font-bold outline-hidden transition"
                />
              </div>
            </div>
            <p className="text-[11px] text-neutral-500">
              Format internasional diawali kode negara <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono font-bold text-neutral-800">628...</code> (otomatis disesuaikan).
            </p>
          </div>

          {/* Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Preview Pesan Otomatis
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs flex items-center gap-1 text-neutral-700 hover:text-neutral-950 font-bold cursor-pointer transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-neutral-950" />
                    <span className="text-neutral-950">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-4 bg-neutral-950 text-neutral-100 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto border border-neutral-800">
              {messageText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-neutral-950" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Teks Tersalin!' : 'Salin Pesan'}
          </button>

          {rawCleanPhone ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-[#FFD400] hover:bg-[#E6BE00] active:bg-[#CCAA00] text-neutral-950 text-xs font-black flex items-center gap-2 shadow-xs transition cursor-pointer border border-[#E6BE00]"
            >
              <MessageSquare className="w-4 h-4 fill-neutral-950" />
              <span>Buka WhatsApp Web / App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              disabled
              className="px-5 py-2.5 rounded-xl bg-neutral-200 text-neutral-400 text-xs font-bold flex items-center gap-2 cursor-not-allowed border border-neutral-300"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Masukkan Nomor WA Klien</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
