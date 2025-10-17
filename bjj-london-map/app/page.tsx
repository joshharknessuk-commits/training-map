'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Controls } from '../components/Controls';
import { Legend } from '../components/Legend';
import { useGyms } from '../state/useGyms';

const MAP_STYLES = [
  {
    id: 'carto-light',
    label: 'Carto Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: 'carto-dark',
    label: 'Carto Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: 'osm-standard',
    label: 'OSM Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
] as const;

const MapView = dynamic(
  () => import('../components/MapView').then((mod) => mod.MapView),
  { ssr: false },
);

export default function HomePage() {
  const [mapStyleIndex, setMapStyleIndex] = useState(0);
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
    searchTerm,
    setSearchTerm,
    boroughOptions,
    selectedBoroughs,
    toggleBorough,
    clearFilters,
  } = useGyms();
  const mapStyle = MAP_STYLES[mapStyleIndex];
  const nextMapStyle = MAP_STYLES[(mapStyleIndex + 1) % MAP_STYLES.length];

  const handleMapStyleChange = () => {
    setMapStyleIndex((previous) => (previous + 1) % MAP_STYLES.length);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0">
        <MapView
          gyms={filteredGyms}
          radiusMiles={radius}
          showRings={showRings}
          fillOpacity={opacity}
          mapStyle={mapStyle}
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
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        boroughOptions={boroughOptions}
        selectedBoroughs={selectedBoroughs}
        toggleBorough={toggleBorough}
        clearFilters={clearFilters}
      />

      <Legend />

      <button
        className="fixed top-6 right-6 z-[920] rounded-full bg-slate-900/85 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-black/40 transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#ffdf00]/60"
        type="button"
        onClick={handleMapStyleChange}
      >
        Map style: {mapStyle.label}
        <span className="ml-2 text-[10px] text-white/60">→ {nextMapStyle.label}</span>
      </button>

      {loading ? (
        <div className="pointer-events-none fixed top-20 right-6 z-[900] rounded-xl bg-slate-900/85 px-3 py-2 text-sm font-semibold text-[#ffdf00] shadow-lg shadow-black/40 backdrop-blur">
          Loading gyms…
        </div>
      ) : null}

      {error ? (
        <div className="fixed top-24 left-1/2 z-[900] -translate-x-1/2 rounded-xl bg-rose-500/90 px-4 py-2 text-sm text-white shadow-lg">
          {error}
        </div>
      ) : null}
    </div>
  );
}
