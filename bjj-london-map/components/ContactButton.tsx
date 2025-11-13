'use client';

import { useEffect, useState } from 'react';
import { FeedbackModal } from '@/components/FeedbackModal';

interface ContactButtonProps {
  className?: string;
  buttonClassName?: string;
}

export function ContactButton({ className, buttonClassName }: ContactButtonProps = {}) {
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!showSuccess) {
      return;
    }
    const timer = window.setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [showSuccess]);

  const handleSuccess = () => {
    setOpen(false);
    setShowSuccess(true);
  };

  const wrapperClasses = ['flex flex-col items-end gap-2', className].filter(Boolean).join(' ');
  const baseButtonClasses =
    'inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-950/70 ring-1 ring-white/10 transition hover:bg-slate-800 hover:ring-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-75';
  const buttonClasses = [baseButtonClasses, buttonClassName].filter(Boolean).join(' ');

  return (
    <>
      <div className={wrapperClasses}>
        {showSuccess ? (
          <div
            className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-900/40"
            role="status"
          >
            Thanks for reaching out!
          </div>
        ) : null}
        <button
          type="button"
          className={buttonClasses}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <span aria-hidden="true">💬</span>
          Contact
        </button>
      </div>
      <FeedbackModal open={open} onClose={() => setOpen(false)} onSuccess={handleSuccess} />
    </>
  );
}
