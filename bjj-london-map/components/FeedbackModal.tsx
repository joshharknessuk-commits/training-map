'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function FeedbackModal({ open, onClose, onSuccess }: FeedbackModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disableActions = submitting;

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setMessage('');
    setWebsite('');
    setError(null);
    setSubmitting(false);
  }, []);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const fallback = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 20);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const container = dialogRef.current;
      if (!container) {
        return;
      }

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
      ).filter((element) => !element.hasAttribute('data-focus-guard'));

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      window.clearTimeout(fallback);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  const handleOverlayClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !submitting) {
      onClose();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    if (message.trim().length < 10) {
      setError('Message must be at least 10 characters long.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          website,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        const fallbackMessage = response.status >= 500 ? 'Server error.' : 'Submission failed.';
        setError(data?.message ?? fallbackMessage);
        setSubmitting(false);
        return;
      }

      onSuccess();
      resetForm();
    } catch {
      setError('Network error. Please try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) {
      return;
    }
    resetForm();
    onClose();
  };

  const dialogClasses = useMemo(
    () =>
      'pointer-events-auto w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/95 text-slate-100 shadow-2xl shadow-slate-900/80 backdrop-blur',
    [],
  );

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/70 px-3 py-6 sm:px-4 sm:py-10"
      onClick={handleOverlayClick}
      style={{
        paddingTop: 'calc(var(--safe-area-top) + 1rem)',
        paddingBottom: 'calc(var(--safe-area-bottom) + var(--mobile-action-bar-offset) + 1rem)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-dialog-title"
        aria-describedby="feedback-dialog-description"
        className={`${dialogClasses} relative flex flex-col overflow-hidden p-6`}
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
        style={{
          maxHeight:
            'min(660px, calc(100vh - var(--safe-area-top) - var(--safe-area-bottom) - var(--mobile-action-bar-offset) - 1.5rem))',
        }}
      >
        <button
          type="button"
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
          onClick={handleCancel}
          disabled={disableActions}
        >
          Close
        </button>

        <div className="space-y-2 pr-10">
          <p
            id="feedback-dialog-title"
            className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300"
          >
            Contact
          </p>
          <h2 className="text-xl font-semibold text-white">Share feedback</h2>
          <p id="feedback-dialog-description" className="text-sm text-slate-400">
            Send ideas, corrections, or quick notes to help improve the map.
          </p>
        </div>

        <form className="mt-4 flex flex-1 flex-col gap-4 overflow-y-auto pr-1" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-200">
            Name (optional)
            <input
              ref={nameInputRef}
              type="text"
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              value={name}
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="block text-sm font-medium text-slate-200">
            Email (optional)
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              value={email}
              maxLength={120}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="block text-sm font-medium text-slate-200">
            Message
            <textarea
              className="mt-1 h-32 w-full resize-none rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              minLength={10}
              maxLength={1000}
              required
            />
          </label>

          <label className="sr-only" aria-hidden="true">
            Website
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500/60"
              onClick={handleCancel}
              disabled={disableActions}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/40 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/70 disabled:cursor-not-allowed disabled:opacity-80"
              disabled={disableActions}
            >
              {submitting ? 'Sending…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
