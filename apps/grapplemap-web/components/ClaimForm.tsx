'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { claimSchema } from '@/lib/validation/claim';

interface ClaimFormProps {
  gymId: string;
  gymName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface ClientErrors {
  name?: string;
  email?: string;
  proof?: string;
  message?: string;
  form?: string;
}

export function ClaimForm({ gymId, gymName, onClose, onSuccess }: ClaimFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [proof, setProof] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState('');
  const [errors, setErrors] = useState<ClientErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !dialogRef.current) {
      return;
    }

    const firstInput = dialogRef.current.querySelector<HTMLInputElement>('input:not([type=hidden])');
    firstInput?.focus();
  }, [mounted]);

  const closeAndReset = useCallback(() => {
    setName('');
    setEmail('');
    setProof('');
    setMessage('');
    setCompany('');
    setErrors({});
    setSubmitting(false);
    onClose();
  }, [onClose]);

  const validationData = useMemo(
    () => ({
      gymId,
      name,
      email,
      proof,
      message,
    }),
    [gymId, name, email, proof, message],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAndReset();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeAndReset]);

  const collectErrors = useCallback(() => {
    const result = claimSchema.safeParse(validationData);
    if (result.success) {
      setErrors({});
      return result.data;
    }

    const fieldErrors: ClientErrors = {};
    const flattened = result.error.flatten();
    if (flattened.fieldErrors.name?.[0]) {
      fieldErrors.name = flattened.fieldErrors.name[0];
    }
    if (flattened.fieldErrors.email?.[0]) {
      fieldErrors.email = flattened.fieldErrors.email[0];
    }
    if (flattened.fieldErrors.proof?.[0]) {
      fieldErrors.proof = flattened.fieldErrors.proof[0];
    }
    if (flattened.fieldErrors.message?.[0]) {
      fieldErrors.message = flattened.fieldErrors.message[0];
    }
    if (flattened.formErrors[0]) {
      fieldErrors.form = flattened.formErrors[0];
    }

    setErrors(fieldErrors);
    return null;
  }, [validationData]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrors({});

      const validated = collectErrors();
      if (!validated) {
        return;
      }

      setSubmitting(true);

      try {
        const response = await fetch('/api/claim', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gymId: validated.gymId,
            name: validated.name,
            email: validated.email,
            proof: validated.proof ?? '',
            message: validated.message ?? '',
            company,
          }),
        });

        if (!response.ok) {
          let errorMessage = 'Unable to submit your claim right now.';
          try {
            const json = (await response.json()) as { error?: string };
            if (json.error) {
              errorMessage = json.error;
            }
          } catch {
            // ignore JSON parse failures and fall back to default message
          }
          setErrors({ form: errorMessage });
          return;
        }

        onSuccess();
        closeAndReset();
      } catch (error) {
        console.error('Failed to submit claim', error);
        setErrors({ form: 'Unable to submit your claim right now.' });
      } finally {
        setSubmitting(false);
      }
    },
    [collectErrors, company, closeAndReset, onSuccess],
  );

  const handleBackdropClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        closeAndReset();
      }
    },
    [closeAndReset],
  );

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-modal-title"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />

      <div
        ref={dialogRef}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/95 p-6 text-slate-100 shadow-2xl shadow-slate-950/60"
      >
        <button
          type="button"
          onClick={closeAndReset}
          className="absolute right-4 top-4 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600 transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          aria-label="Close claim form"
        >
          Close
        </button>

        <h3 id="claim-modal-title" className="text-lg font-semibold text-brand-500">
          Claim “{gymName}”
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          Submit your details to verify ownership. We’ll follow up by email within 1–2 working days.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="company"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <label className="block text-sm font-medium text-slate-200">
            Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              maxLength={120}
              required
            />
            {errors.name ? <span className="mt-1 block text-xs text-rose-600">{errors.name}</span> : null}
          </label>

          <label className="block text-sm font-medium text-slate-200">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              required
            />
            {errors.email ? (
              <span className="mt-1 block text-xs text-rose-600">{errors.email}</span>
            ) : null}
          </label>

          <label className="block text-sm font-medium text-slate-200">
            Proof link (optional)
            <input
              type="url"
              value={proof}
              onChange={(event) => setProof(event.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              placeholder="https://"
            />
            {errors.proof ? (
              <span className="mt-1 block text-xs text-rose-600">{errors.proof}</span>
            ) : null}
          </label>

          <label className="block text-sm font-medium text-slate-200">
            Message (optional)
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-1 h-28 w-full rounded-xl border border-neutral-300 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              maxLength={1000}
            />
            <span className="mt-1 block text-xs text-slate-400">
              {message.length} / 1000 characters
            </span>
            {errors.message ? (
              <span className="mt-1 block text-xs text-rose-600">{errors.message}</span>
            ) : null}
          </label>

          {errors.form ? (
            <div className="rounded-xl border border-rose-400 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {errors.form}
            </div>
          ) : null}

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-glow transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit claim'}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
