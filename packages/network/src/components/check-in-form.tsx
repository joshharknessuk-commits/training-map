'use client';

import { useFormState, useFormStatus } from 'react-dom';
import type { CheckInActionState } from '../server/qr';
import { completeCheckIn } from '../server/qr';

const initialState: CheckInActionState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      disabled={status.pending}
      className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-80"
    >
      {status.pending ? 'Verifying…' : 'Record check-in'}
    </button>
  );
}

export function CheckInForm() {
  const [state, formAction] = useFormState(completeCheckIn, initialState);

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-white/10 bg-neutral-900/70 p-6 shadow-glow backdrop-blur"
    >
      <h2 className="text-lg font-semibold text-white">Manual QR Check-in</h2>
      <p className="mt-1 text-sm text-neutral-800">
        Scan the rotating QR marker at the gym or enter the alphanumeric code manually.
      </p>

      <label className="mt-6 block text-sm font-medium text-neutral-900">
        Member email
        <input
          type="email"
          name="email"
          required
          className="mt-2 w-full rounded-2xl border border-white/10 bg-neutral-800/80 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-300/70"
          placeholder="you@grapplemap.uk"
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-neutral-900">
        QR code / short code
        <input
          type="text"
          name="code"
          required
          className="mt-2 w-full rounded-2xl border border-white/10 bg-neutral-800/80 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-300/70"
          placeholder="peckham-sunday"
        />
      </label>

      <SubmitButton />

      {state.message ? (
        <p
          className={`mt-4 rounded-2xl px-3 py-2 text-sm ${
            state.success
              ? 'bg-emerald-500/10 text-emerald-200'
              : 'bg-rose-500/10 text-rose-200'
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
