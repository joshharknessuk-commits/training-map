'use client';

import { useEffect, useMemo, useState } from 'react';
import { NearMeButton } from '@/components/NearMeButton';
import { haversineKm } from '@/lib/distance';
import type { Gym } from '@/types/osm';

const MAX_RESULTS = 2;

interface GymListProps {
  gyms: Gym[];
  userLocation?: { lat: number; lng: number } | null;
  onUserLocation?: (coords: { lat: number; lng: number } | null) => void;
  onActiveChange?: (active: boolean) => void;
}

export function GymList({
  gyms,
  userLocation,
  onUserLocation,
  onActiveChange,
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

  const handleLocate = (coords: { lat: number; lng: number }) => {
    setStoredLocation(coords);
    setIsOpen(true);
    onUserLocation?.(coords);
    onActiveChange?.(true);
  };

  const handleClose = () => {
    setStoredLocation(null);
    setIsOpen(false);
    onUserLocation?.(null);
    onActiveChange?.(false);
  };

  const showList = isOpen && Boolean(storedLocation);

  return (
    <div className="pointer-events-auto flex flex-col items-end gap-2.5">
      <NearMeButton onLocate={handleLocate} className="px-2.5 py-1 text-[11px]">
        Near me
      </NearMeButton>

      {showList ? (
        <aside className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-950/90 p-4 text-slate-100 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">Nearby gyms</h3>
              <p className="text-[11px] text-slate-400">Sorted by distance from you</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/80 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              Close
            </button>
          </div>

          <ul className="mt-4 divide-y divide-white/5 text-sm">
            {listItems.length === 0 ? (
              <li className="py-4 text-xs text-slate-400">
                No gyms match the current filters.
              </li>
            ) : (
              listItems.map(({ gym, distanceKm }, index) => (
                <li
                  key={gym.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <div className="font-medium leading-tight">
                      {index < 2 ? (
                        <span className="mr-1.5 inline-flex items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          {index + 1}
                        </span>
                      ) : null}
                      {gym.name}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {distanceKm !== null
                        ? `${distanceKm.toFixed(1)} km away`
                        : gym.borough ?? 'London'}
                    </div>
                  </div>
                  <a
                    className="text-xs font-semibold text-blue-400 underline underline-offset-2"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${gym.lat},${gym.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Directions
                  </a>
                </li>
              ))
            )}
          </ul>
        </aside>
      ) : null}
    </div>
  );
}
