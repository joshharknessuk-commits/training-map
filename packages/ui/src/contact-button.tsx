'use client';

import { useEffect, useState } from 'react';
import { FeedbackModal } from './feedback-modal';

export interface ContactButtonProps {
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
    'inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-soft ring-1 ring-neutral-200 transition hover:bg-neutral-200 hover:ring-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-75';
  const buttonClasses = [baseButtonClasses, buttonClassName].filter(Boolean).join(' ');

  return (
    <>
      <div className={wrapperClasses}>
        {showSuccess ? (
          <div
            className="rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-soft"
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
