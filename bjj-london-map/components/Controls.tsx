'use client';

import { useState, type ChangeEvent } from 'react';

interface ControlsProps {
  radius: number;
  setRadius: (value: number) => void;
  opacity: number;
  setOpacity: (value: number) => void;
  showRings: boolean;
  setShowRings: (value: boolean) => void;
  totalCount: number;
  shownCount: number;
  loading: boolean;
}

export function Controls({
  radius,
  setRadius,
  opacity,
  setOpacity,
  showRings,
  setShowRings,
  totalCount,
  shownCount,
  loading,
}: ControlsProps) {
  const [open, setOpen] = useState(true);

  const handleRadiusChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRadius(Number(event.target.value));
  };

  const handleOpacityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOpacity(Number(event.target.value));
  };

  const handleShowRingsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowRings(event.target.checked);
  };

  if (!open) {
    return (
      <button
        className="fixed top-4 left-4 z-[1000] flex items-center gap-2 rounded-full bg-[#009c3b] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#00277640] transition hover:bg-[#00b84d] focus:outline-none focus:ring-2 focus:ring-[#ffdf00]/80"
        type="button"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">☰</span>
        Controls
      </button>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-[1000] w-80 overflow-hidden rounded-3xl bg-white/95 shadow-xl shadow-[#00277640] ring-1 ring-[#009c3b]/30 backdrop-blur">
      <div className="relative bg-gradient-to-r from-[#ffdf00] via-[#009c3b] to-[#002776] px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">BJJ Gyms</h2>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>
              {shownCount} / {totalCount}
            </span>
            {loading ? (
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#ffdf00]" aria-hidden="true" />
            ) : null}
          </div>
        </div>
        <p className="mt-1 text-xs text-white/80">
          Explore Brazilian Jiu-Jitsu coverage across Greater London.
        </p>
        <button
          className="absolute top-2 right-2 rounded-full bg-white/20 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/60"
          type="button"
          onClick={() => setOpen(false)}
        >
          Collapse
        </button>
      </div>

      <div className="space-y-4 px-4 py-4 text-sm text-slate-700">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#002776]">
            Radius ({radius.toFixed(1)} mi)
          </span>
          <input
            className="mt-2 w-full accent-[#009c3b]"
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={radius}
            onChange={handleRadiusChange}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#002776]">
            Ring Opacity ({opacity.toFixed(2)})
          </span>
          <input
            className="mt-2 w-full accent-[#009c3b]"
            type="range"
            min={0.05}
            max={0.5}
            step={0.01}
            value={opacity}
            onChange={handleOpacityChange}
          />
        </label>

        <label className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#002776]">
            Show rings
          </span>
          <input
            className="h-4 w-4 accent-[#009c3b]"
            type="checkbox"
            checked={showRings}
            onChange={handleShowRingsChange}
          />
        </label>
      </div>
    </div>
  );
}
