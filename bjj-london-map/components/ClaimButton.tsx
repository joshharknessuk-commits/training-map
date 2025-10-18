'use client';

import { useEffect, useRef, useState } from 'react';
import { ClaimForm } from '@/components/ClaimForm';

interface ClaimButtonProps {
  gymId: string;
  gymName: string;
}

const SUCCESS_MESSAGE_DURATION = 3500;

export function ClaimButton({ gymId, gymName }: ClaimButtonProps) {
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showSuccess) {
      return;
    }

    hideTimerRef.current = window.setTimeout(() => {
      setShowSuccess(false);
      hideTimerRef.current = null;
    }, SUCCESS_MESSAGE_DURATION);

    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [showSuccess]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSuccess = () => {
    setShowSuccess(true);
  };

  return (
    <>
      <button
        type="button"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FFCC29] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#002776] shadow-lg shadow-[#FFCC29]/30 transition hover:bg-[#f6bb12] focus:outline-none focus:ring-2 focus:ring-[#009739]/70 focus:ring-offset-2 focus:ring-offset-white"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">🏛️</span>
        Claim this gym
      </button>

      {showSuccess ? (
        <div className="mt-2 rounded-full bg-[#009739]/10 px-3 py-1 text-xs font-semibold text-[#009739] shadow-sm shadow-[#009739]/30">
          OSSS 🤙
        </div>
      ) : null}

      {open ? (
        <ClaimForm gymId={gymId} gymName={gymName} onClose={handleClose} onSuccess={handleSuccess} />
      ) : null}
    </>
  );
}
