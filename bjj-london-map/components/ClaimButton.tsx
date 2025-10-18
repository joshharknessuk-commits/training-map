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
        className="mt-2 text-xs font-semibold text-[#002776] underline transition hover:text-[#009c3b] focus:outline-none focus:ring-2 focus:ring-[#009c3b]"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true" className="mr-1">
          🏛
        </span>
        Claim this gym
      </button>

      {showSuccess ? (
        <div className="mt-2 rounded-full bg-[#009c3b]/10 px-3 py-1 text-xs font-semibold text-[#009c3b] shadow-sm shadow-[#009c3b]/30">
          OSSS 🤙
        </div>
      ) : null}

      {open ? (
        <ClaimForm gymId={gymId} gymName={gymName} onClose={handleClose} onSuccess={handleSuccess} />
      ) : null}
    </>
  );
}
