'use client';

import { useEffect, useState } from 'react';
import { ContactButton } from '@ui/contact-button';
import { NearMeButton } from '@/components/NearMeButton';

const COLLAPSED_VAR = 'var(--mobile-action-bar-collapsed-height)';
const EXPANDED_VAR = 'var(--mobile-action-bar-expanded-height)';
const OFFSET_VARIABLE = '--mobile-action-bar-offset';

interface MobileActionBarProps {
  onLocate: (coords: { lat: number; lng: number }) => void;
  onError?: (error: GeolocationPositionError | null) => void;
}

export function MobileActionBar({ onLocate, onError }: MobileActionBarProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    root.style.setProperty(OFFSET_VARIABLE, expanded ? EXPANDED_VAR : COLLAPSED_VAR);
    return () => {
      root.style.setProperty(OFFSET_VARIABLE, 'var(--mobile-action-bar-collapsed-height)');
    };
  }, [expanded]);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[970] sm:hidden"
      style={{ minHeight: expanded ? EXPANDED_VAR : COLLAPSED_VAR }}
    >
      <div
        className="pointer-events-auto bg-neutral-900/85 px-4 shadow-[0_-16px_32px_rgba(2,6,23,0.8)] backdrop-blur-xl"
        style={{
          paddingTop: expanded ? '0.65rem' : '0.35rem',
          paddingBottom: expanded
            ? 'calc(var(--safe-area-bottom) + 0.5rem)'
            : 'calc(var(--safe-area-bottom) + 0.2rem)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="mx-auto w-full max-w-xl" role="region" aria-label="Mobile actions">
          <button
            type="button"
            onClick={handleToggle}
            aria-expanded={expanded}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md transition hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <span className="text-xs">{expanded ? 'Close actions' : 'Touch for more actions'}</span>
            <span aria-hidden="true" className="text-base leading-none">
              {expanded ? '–' : '⌃'}
            </span>
          </button>

          <div
            className={`mt-1 overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
              expanded ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'
            }`}
            aria-hidden={!expanded}
          >
            <div className="mt-3 flex flex-col gap-3 rounded-3xl border border-white/10 bg-neutral-900/80 p-4 shadow-inner shadow-black/30">
              <ContactButton
                className="w-full items-stretch"
                buttonClassName="w-full justify-center rounded-2xl bg-neutral-800/95 text-sm font-semibold uppercase tracking-wide text-white min-h-[44px] px-4 py-2.5 shadow-lg shadow-black/40 focus-visible:ring-sky-400"
              />
              <NearMeButton
                onLocate={onLocate}
                onError={onError}
                className="min-h-[44px] w-full justify-center rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-sky-500 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-glow transition hover:scale-[1.01]"
              >
                Gyms near me
              </NearMeButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
