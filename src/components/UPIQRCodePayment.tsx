import React, { useMemo, useState } from 'react';
import { CheckCircle2, Copy, ExternalLink, Smartphone, X } from 'lucide-react';

interface UPIQRCodePaymentProps {
  profileName?: string;
  amount: string;
  title: string;
  onComplete: (reference: string) => Promise<void>;
  onCancel: () => void;
}

export default function UPIQRCodePayment({
  profileName = 'Student',
  amount,
  title,
  onComplete,
  onCancel,
}: UPIQRCodePaymentProps) {
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // The QR image is supplied by CME and is intentionally used as a static payment QR.
  const qrPath = '/cme-payment-qr.png';
  const upiApps = useMemo(() => ['PhonePe', 'Google Pay', 'Paytm', 'BHIM / UPI App'], []);

  const copyAmount = async () => {
    try {
      await navigator.clipboard.writeText(amount.replace(/[^0-9.]/g, ''));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be unavailable on some browsers; payment can continue normally.
    }
  };

  const submit = async () => {
    const trimmed = reference.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onComplete(trimmed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-[#061F48]/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-[#061F48]/10 dark:border-gray-700 relative">
        <button onClick={onCancel} className="absolute right-4 top-4 z-10 p-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15" aria-label="Close payment">
          <X className="h-5 w-5 text-gray-600 dark:text-gray-200" />
        </button>

        <div className="bg-[#061F48] text-white px-6 py-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-black text-white/60">CME UPI PAYMENT</div>
          <h3 className="text-xl font-black mt-1">Scan & Pay</h3>
          <p className="text-xs text-white/70 mt-1">No payment gateway is used. Pay directly using the CME payment QR.</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between rounded-2xl bg-[#F8F5ED] border border-[#D09515]/20 p-4">
            <div>
              <p className="text-[9px] uppercase tracking-widest font-black text-gray-400">Payment for</p>
              <p className="text-sm font-extrabold text-[#061F48] mt-1">{title}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{profileName}</p>
            </div>
            <button type="button" onClick={copyAmount} className="text-right group" title="Copy amount">
              <p className="text-[9px] uppercase tracking-widest font-black text-gray-400">Amount</p>
              <p className="text-2xl font-black text-[#D09515]">{amount}</p>
              <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#061F48] inline-flex items-center gap-1">
                {copied ? 'Copied' : <><Copy className="h-3 w-3" /> Tap to copy</>}
              </span>
            </button>
          </div>

          <div className="flex justify-center">
            <div className="bg-black rounded-3xl p-3 shadow-xl">
              <img src={qrPath} alt="CME PhonePe payment QR code" className="w-[260px] h-[390px] object-contain rounded-2xl bg-black" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm font-black text-[#061F48] dark:text-white">Scan with any UPI app</p>
            <div className="flex flex-wrap justify-center gap-2">
              {upiApps.map(app => (
                <span key={app} className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-300">{app}</span>
              ))}
            </div>
            <a href="https://www.phonepe.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-black text-[#6F2DBD] hover:underline">
              Open PhonePe <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3">
              <Smartphone className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-amber-900">After payment</p>
                <p className="text-[10px] leading-relaxed font-semibold text-amber-800/80 mt-1">
                  Enter the UTR / transaction reference shown by your UPI app. CME can use it to reconcile the payment manually. Do not enter your UPI PIN here.
                </p>
              </div>
            </div>
          </div>

          <input
            value={reference}
            onChange={e => setReference(e.target.value.slice(0, 40))}
            placeholder="Enter UTR / transaction reference"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold outline-none focus:ring-2 focus:ring-[#D09515]/30"
          />

          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Cancel
            </button>
            <button
              type="button"
              disabled={!reference.trim() || submitting}
              onClick={submit}
              className="flex-[1.5] py-3 rounded-xl bg-[#061F48] hover:bg-[#D09515] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? 'Submitting…' : <><CheckCircle2 className="h-4 w-4" /> I’ve Completed Payment</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
