'use client';

import { useEffect, useMemo, useState } from 'react';
import { haversineKm } from '@/lib/distance';
import { buildDirectionsUrl } from '@/lib/directions';
import type { Gym } from '@/types/osm';

const MAX_RESULTS = 2;

interface GymListProps {
  gyms: Gym[];
  userLocation?: { lat: number; lng: number } | null;
  onUserLocation?: (coords: { lat: number; lng: number } | null) => void;
  onActiveChange?: (active: boolean) => void;
  selectedGymId?: string | null;
  onSelectGym?: (gym: Gym | null) => void;
}

export function GymList({
  gyms,
  userLocation,
  onUserLocation,
  onActiveChange,
  selectedGymId,
  onSelectGym,
}: GymListProps) {
  const [storedLocation, setStoredLocation] = useState<typeof userLocation>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!userLocation) {
      setStoredLocation(null);
      setIsOpen(false);
      onActiveChange?.(false);
      return;
    }

    setStoredLocation(userLocation);
    setIsOpen(true);
    onActiveChange?.(true);
  }, [userLocation, onActiveChange]);

  const listItems = useMemo(() => {
    if (!storedLocation) {
      return gyms.slice(0, MAX_RESULTS).map((gym) => ({
        gym,
        distanceKm: null as number | null,
      }));
    }

    return gyms
      .map((gym) => ({
        gym,
        distanceKm: haversineKm(
          { lat: gym.lat, lon: gym.lon },
          { lat: storedLocation.lat, lng: storedLocation.lng },
        ),
      }))
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
      .slice(0, MAX_RESULTS);
  }, [gyms, storedLocation]);

  const handleClose = () => {
    setStoredLocation(null);
    setIsOpen(false);
    onUserLocation?.(null);
    onActiveChange?.(false);
    onSelectGym?.(null);
  };

  const handleSelectGym = (gym: Gym) => {
    setIsOpen(true);
    setStoredLocation((prev) => prev ?? userLocation ?? null);
    onSelectGym?.(gym);
  };

  const showList = isOpen && Boolean(storedLocation);

  return (
    <div className="pointer-events-auto flex w-full max-w-sm flex-col items-stretch">
      {showList ? (
        <aside className="max-h-[calc(100vh-144px)] overflow-y-auto rounded-3xl border border-neutral-200 bg-white/90 p-4 text-neutral-900 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-500">
                <span aria-hidden="true" className="text-base">
                  🚶‍♀️
                </span>
                Nearby gyms
              </div>
              <p className="mt-1 text-xs text-neutral-600">Sorted by distance from you</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-900/80 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              Close
            </button>
          </div>

          <ul className="mt-4 flex flex-col gap-3 text-sm">
            {listItems.length === 0 ? (
              <li className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-4 text-xs text-neutral-600">
                No gyms match the current filters.
              </li>
            ) : (
              listItems.map(({ gym, distanceKm }, index) => (
                <li key={gym.id}>
                  <article
                    className={`rounded-2xl border px-4 py-3 shadow-sm transition ${
                      selectedGymId === gym.id
                        ? 'border-[#38bdf8]/70 bg-[#0f172a]/90 text-neutral-900 shadow-[#38bdf8]/40'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-900/90 hover:border-white/30 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {index < 2 ? (
                        <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-[11px] font-semibold text-slate-900 shadow shadow-glow">
                          {index + 1}
                        </span>
                      ) : (
                        <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-neutral-50/80 text-[11px] font-semibold text-neutral-900/70">
                          {index + 1}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSelectGym(gym)}
                        className="flex flex-1 flex-col items-start text-left"
                        aria-pressed={selectedGymId === gym.id}
                      >
                        <span className="text-sm font-semibold leading-tight text-neutral-900">
                          {gym.name}
                        </span>
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-900/70">
                          <span aria-hidden="true">📏</span>
                          {distanceKm !== null
                            ? `${distanceKm.toFixed(1)} km away`
                            : gym.borough ?? 'London'}
                        </span>
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                      {gym.website ? (
                        <a
                          className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-900/80 underline underline-offset-2 transition hover:bg-white/20"
                          href={gym.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Website
                        </a>
                      ) : (
                        <span className="text-neutral-900/40">No website listed</span>
                      )}
                      <a
                        className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-400 to-accent-400 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-900 transition hover:scale-[1.01]"
                        href={buildDirectionsUrl({ lat: gym.lat, lon: gym.lon }, storedLocation)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span aria-hidden="true">🧭</span>
                        Directions
                      </a>
                    </div>
                  </article>
                </li>
              ))
            )}
          </ul>
        </aside>
      ) : null}
    </div>
  );
}
