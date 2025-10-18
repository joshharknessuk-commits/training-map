'use client';

import { useMemo } from 'react';
import { ClaimButton } from '@/components/ClaimButton';
import type { Gym } from '@/types/osm';

interface GymMicroInfoCardProps {
  gym: Gym | null;
  visible: boolean;
  onClose?: () => void;
}

interface QuickStat {
  icon: string;
  label: string;
  value: string;
}

const MEMBER_NUMBER_FORMATTER = new Intl.NumberFormat('en-GB', {
  maximumFractionDigits: 0,
});

const CARD_BASE_CLASSES =
  'transform rounded-3xl border border-white/10 bg-slate-950/95 p-5 text-slate-100 shadow-[0_18px_42px_-18px_rgba(15,23,42,0.95)] backdrop-blur transition-all duration-300 ease-out';

const CARD_VISIBLE_CLASSES = 'pointer-events-auto translate-y-0 opacity-100';
const CARD_HIDDEN_CLASSES = 'pointer-events-none translate-y-6 opacity-0';

const QUICK_STAT_STYLE_KEYS = ['martial_art', 'style', 'sport'];
const QUICK_STAT_COACH_KEYS = ['coach', 'contact:person', 'contact:name', 'instructor'];
const QUICK_STAT_MEMBERS_KEYS = ['members', 'capacity', 'capacity:persons'];

const DEFAULT_STYLE = 'Brazilian Jiu-Jitsu';

function extractTagValue(gym: Gym, keys: string[]): string | null {
  for (const key of keys) {
    const rawValue = gym.tags?.[key];
    if (rawValue) {
      return rawValue;
    }
  }

  return null;
}

function humanise(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .trim();
}

function formatMemberCount(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const numeric = Number.parseInt(value, 10);
  if (Number.isFinite(numeric) && numeric > 0) {
    return `${MEMBER_NUMBER_FORMATTER.format(numeric)} members`;
  }

  return null;
}

function buildDirectionsUrl(gym: Gym) {
  const params = new URLSearchParams({
    api: '1',
    destination: `${gym.lat},${gym.lon}`,
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function GymMicroInfoCard({ gym, visible, onClose }: GymMicroInfoCardProps) {
  const quickStats = useMemo<QuickStat[]>(() => {
    if (!gym) {
      return [];
    }

    const style = humanise(extractTagValue(gym, QUICK_STAT_STYLE_KEYS)) || DEFAULT_STYLE;
    const coach = humanise(extractTagValue(gym, QUICK_STAT_COACH_KEYS)) || 'Coach info coming soon';
    const members =
      formatMemberCount(extractTagValue(gym, QUICK_STAT_MEMBERS_KEYS)) || 'Members not listed';
    const borough = gym.borough ?? 'Borough not listed';

    return [
      { icon: '🥋', label: 'Style', value: style },
      { icon: '🏙️', label: 'Borough', value: borough },
      { icon: '🧑‍🏫', label: 'Head coach', value: coach },
      { icon: '👥', label: 'Members', value: members },
    ];
  }, [gym]);

  if (!gym) {
    return null;
  }

  const cardVisibilityClass = visible ? CARD_VISIBLE_CLASSES : CARD_HIDDEN_CLASSES;

  return (
    <article className={`${CARD_BASE_CLASSES} ${cardVisibilityClass}`}>
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ffdf00]">Quick stats</p>
          <h2 className="text-lg font-semibold leading-tight text-white">{gym.name}</h2>
          {gym.nearestTransport ? (
            <p className="flex items-center gap-1 text-xs text-white/70">
              <span aria-hidden="true">🚇</span>
              {gym.nearestTransport}
            </p>
          ) : null}
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/70 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
            aria-label="Close gym preview"
          >
            Close
          </button>
        ) : null}
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/80">
        {quickStats.map(({ icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 shadow-sm shadow-black/20"
          >
            <dt className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-white/60">
              <span aria-hidden="true">{icon}</span>
              {label}
            </dt>
            <dd className="text-sm text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <a
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#ffdf00]/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-900 transition hover:bg-[#ffdf00] focus:outline-none focus:ring-2 focus:ring-[#009c3b]/50"
          href={buildDirectionsUrl(gym)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span aria-hidden="true">🧭</span>
          Directions
        </a>
        {gym.website ? (
          <a
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
            href={gym.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span aria-hidden="true">🌐</span>
            Website
          </a>
        ) : null}
      </div>

      <div className="mt-3">
        <ClaimButton gymId={gym.id} gymName={gym.name} />
      </div>

      <div className="mt-3 space-y-2 text-[11px] text-white/60">
        {gym.extraWebsites && gym.extraWebsites.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {gym.extraWebsites.map((url) => (
              <a
                key={url}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-white/70 transition hover:border-white/40 hover:text-white"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span aria-hidden="true">🔗</span>
                More info
              </a>
            ))}
          </div>
        ) : null}

        <a
          className="inline-flex items-center gap-1 text-white/60 underline underline-offset-2 transition hover:text-white"
          href={gym.osmUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span aria-hidden="true">🗺️</span>
          Open in OpenStreetMap
        </a>
      </div>
    </article>
  );
}
