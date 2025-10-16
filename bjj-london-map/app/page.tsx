'use client';

import dynamic from 'next/dynamic';
import { Controls } from '../components/Controls';
import { Legend } from '../components/Legend';
import { useGyms } from '../state/useGyms';

const MapView = dynamic(
  () => import('../components/MapView').then((mod) => mod.MapView),
  { ssr: false },
);

export default function HomePage() {
  const {
    filteredGyms,
    radius,
    setRadius,
    opacity,
    setOpacity,
    showRings,
    setShowRings,
    totalCount,
    shownCount,
    loading,
    error,
  } = useGyms();

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-[#002776] via-[#009c3b] to-[#ffdf00] text-slate-100">
      <div className="absolute inset-0">
        <MapView
          gyms={filteredGyms}
          radiusMiles={radius}
          showRings={showRings}
          fillOpacity={opacity}
        />
      </div>

      <Controls
        radius={radius}
        setRadius={setRadius}
        opacity={opacity}
        setOpacity={setOpacity}
        showRings={showRings}
        setShowRings={setShowRings}
        totalCount={totalCount}
        shownCount={shownCount}
        loading={loading}
      />

      <Legend />

      {loading ? (
        <div className="pointer-events-none fixed top-4 right-4 z-[1000] rounded-xl bg-[#002776]/85 px-3 py-2 text-sm font-semibold text-[#ffdf00] shadow-lg shadow-[#00277640] backdrop-blur">
          Loading gyms…
        </div>
      ) : null}

      {error ? (
        <div className="fixed top-24 left-1/2 z-[1100] -translate-x-1/2 rounded-xl bg-rose-500/90 px-4 py-2 text-sm text-white shadow-lg">
          {error}
        </div>
      ) : null}
    </div>
  );
}
