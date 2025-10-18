'use client';

import { ClaimButton } from '@/components/ClaimButton';
import { haversineKm } from '@/lib/distance';
import type { Gym } from '@/types/osm';

interface SelectedGymCardProps {
  gym: Gym;
  onClose: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

export function SelectedGymCard({ gym, onClose, userLocation }: SelectedGymCardProps) {
  const distanceKm =
    userLocation != null
      ? haversineKm(
          { lat: gym.lat, lon: gym.lon },
          { lat: userLocation.lat, lng: userLocation.lng },
        )
      : null;

  return (
    <aside className="pointer-events-auto w-full max-w-sm max-h-[calc(100vh-180px)] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/95 p-5 text-slate-100 shadow-[0_20px_45px_-15px_rgba(15,23,42,0.9)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#ffdf00]">
            Selected gym
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-tight">{gym.name}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          Close
        </button>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        {distanceKm !== null ? (
          <div className="flex items-center justify-between rounded-2xl border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-blue-100">
            <dt className="flex items-center gap-2 font-semibold">
              <span aria-hidden="true">📍</span>
              Distance
            </dt>
            <dd>{distanceKm.toFixed(1)} km away</dd>
          </div>
        ) : null}
        {gym.nearestTransport ? (
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70">
              <span aria-hidden="true">🚇</span>
              Nearest
            </dt>
            <dd className="text-sm text-white/80">{gym.nearestTransport}</dd>
          </div>
        ) : null}
        {gym.borough ? (
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70">
              <span aria-hidden="true">🏷️</span>
              Borough
            </dt>
            <dd className="text-sm text-white/80">{gym.borough}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-4 space-y-2 text-sm">
        {gym.website ? (
          <a
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#ffdf00]/60"
            href={gym.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span aria-hidden="true">🌐</span>
            Visit website
          </a>
        ) : null}
        {gym.extraWebsites?.map((url) => (
          <a
            key={url}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#ffdf00]/40"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span aria-hidden="true">🔗</span>
            Additional link
          </a>
        ))}
        <ClaimButton gymId={gym.id} gymName={gym.name} />
        <a
          className="block text-center text-xs text-white/50 underline underline-offset-2 transition hover:text-white/80"
          href={gym.osmUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in OpenStreetMap
        </a>
      </div>
    </aside>
  );
}
