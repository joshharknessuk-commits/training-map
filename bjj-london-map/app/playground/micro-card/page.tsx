'use client';

import { useMemo, useState } from 'react';
import { GymMicroInfoCard } from '@/components/GymMicroInfoCard';
import type { Gym } from '@/types/osm';

const SAMPLE_GYMS: Gym[] = [
  {
    id: 'demo-bjj-001',
    name: 'Shoreditch Roll Factory',
    lat: 51.5245,
    lon: -0.0782,
    borough: 'Hackney',
    nearestTransport: 'Shoreditch High Street Overground (4 min walk)',
    website: 'https://shoreditchrollfactory.example.com',
    extraWebsites: ['https://instagram.com/shoreditchrollfactory'],
    osmUrl: 'https://www.openstreetmap.org/way/000000001',
    tags: {
      sport: 'martial_arts',
      martial_art: 'brazilian_jiu_jitsu',
      coach: 'Alex Kim',
      members: '185',
    },
  },
  {
    id: 'demo-bjj-002',
    name: 'Westminster Grappling Club',
    lat: 51.4975,
    lon: -0.1357,
    borough: 'Westminster',
    nearestTransport: 'St. James’s Park Underground (6 min walk)',
    website: 'https://westminstergrappling.example.com',
    extraWebsites: ['https://facebook.com/westminstergrappling'],
    osmUrl: 'https://www.openstreetmap.org/node/000000002',
    tags: {
      sport: 'martial_arts',
      style: 'nogi',
      'contact:person': 'Priya Patel',
      members: '90',
    },
  },
  {
    id: 'demo-bjj-003',
    name: 'Croydon Night Rollers',
    lat: 51.3725,
    lon: -0.0983,
    borough: 'Croydon',
    nearestTransport: 'West Croydon Station (5 min walk)',
    website: 'https://croydonnightrollers.example.com',
    extraWebsites: ['https://twitter.com/croydonnightrollers'],
    osmUrl: 'https://www.openstreetmap.org/node/000000003',
    tags: {
      sport: 'martial_arts',
      martial_art: 'brazilian_jiu_jitsu',
      instructor: 'Jordan Evans',
    },
  },
];

const CARD_VARIANTS: Array<{ id: string; label: string; gym: Gym | null }> = [
  { id: 'shoreditch', label: 'Full data', gym: SAMPLE_GYMS[0] },
  { id: 'westminster', label: 'Partial data', gym: SAMPLE_GYMS[1] },
  { id: 'croydon', label: 'Missing members', gym: SAMPLE_GYMS[2] },
  { id: 'empty', label: 'No gym selected', gym: null },
];

export default function GymMicroCardPlaygroundPage() {
  const [selectedVariantId, setSelectedVariantId] = useState(CARD_VARIANTS[0].id);

  const { gym } = useMemo(() => {
    return (
      CARD_VARIANTS.find((variant) => variant.id === selectedVariantId) ?? CARD_VARIANTS[0]
    );
  }, [selectedVariantId]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#ffdf00]">
            Playground
          </p>
          <h1 className="text-3xl font-bold text-white">Gym micro info card preview</h1>
          <p className="text-sm text-white/70">
            Use the toggles below to visualise how the card renders with different combinations of
            gym data — the same component is rendered on the home page when you hover or click a
            marker.
          </p>
        </header>

        <section className="flex flex-wrap justify-center gap-3">
          {CARD_VARIANTS.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelectedVariantId(variant.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#009c3b]/60 ${
                selectedVariantId === variant.id
                  ? 'border-[#ffdf00]/80 bg-[#ffdf00]/90 text-slate-900 shadow-lg shadow-black/30'
                  : 'border-white/15 bg-white/5 text-white/80 hover:border-white/40 hover:text-white'
              }`}
            >
              {variant.label}
            </button>
          ))}
        </section>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute inset-x-0 bottom-0 top-20 rounded-[36px] bg-gradient-to-b from-white/5 via-white/2 to-transparent blur-3xl" />
          <div className="relative">
            <GymMicroInfoCard gym={gym} visible={Boolean(gym)} onClose={() => setSelectedVariantId('empty')} />
          </div>
        </div>

        <footer className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          <p className="font-semibold text-white">How to use this page</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Run <code>pnpm dev</code> from the repo root.</li>
            <li>Open <code>http://localhost:3000/playground/micro-card</code> in your browser.</li>
            <li>
              Toggle between the variants to review how the micro info card adapts to complete,
              partial, or missing OpenStreetMap data.
            </li>
          </ol>
          <p className="mt-4 text-xs text-white/60">
            This playground is intended for development and QA review so you can visualise the card
            without navigating the full map experience.
          </p>
        </footer>
      </div>
    </main>
  );
}
