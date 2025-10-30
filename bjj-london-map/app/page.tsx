'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Controls } from '@/components/Controls';
import { GymList } from '@/components/GymList';
import { NearMeButton } from '@/components/NearMeButton';
import { useGyms } from '@/state/useGyms';
import { useGeodata } from '@/state/useGeodata';
import { DEFAULT_MAP_STYLE_INDEX, MAP_STYLES } from '@/app/config/mapStyles';
import { haversineKm } from '@/lib/distance';
import type { Gym } from '@/types/osm';

const MapView = dynamic(() => import('@/components/MapView').then((mod) => mod.MapView), {
  ssr: false,
});

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    return window.innerWidth >= 1024;
  });
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showBoroughHighlights, setShowBoroughHighlights] = useState(false);
  const [showGymMarkers, setShowGymMarkers] = useState(true);
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
  const mapStyle = MAP_STYLES[DEFAULT_MAP_STYLE_INDEX];
  const {
    boroughs: boroughFeatures,
    loading: geodataLoading,
    error: geodataError,
  } = useGeodata();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let lastIsLarge = window.innerWidth >= 1024;
    setFiltersOpen(lastIsLarge);

    const handleResize = () => {
      const isLarge = window.innerWidth >= 1024;
      if (isLarge && !lastIsLarge) {
        setFiltersOpen(true);
      } else if (!isLarge && lastIsLarge) {
        setFiltersOpen(false);
      }
      lastIsLarge = isLarge;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const handleNearMeLocate = useCallback(
    (coords: { lat: number; lng: number }) => {
      setUserLocation(coords);
      setNearMeActive(true);
      setSelectedGym(null);
    },
    [],
  );

  const handleNearMeError = useCallback(() => {
    setNearMeActive(false);
  }, []);

  const safeSelectedGym = useMemo(() => {
    if (!selectedGym) {
      return null;
    }
    return filteredGyms.find((gym) => gym.id === selectedGym.id) ?? null;
  }, [filteredGyms, selectedGym]);

  useEffect(() => {
    if (selectedGym && !safeSelectedGym) {
      setSelectedGym(null);
    }
  }, [safeSelectedGym, selectedGym]);

  const highlightedGymIds = useMemo(() => {
    if (!userLocation || !nearMeActive) {
      return [];
    }

    return filteredGyms
      .map((gym) => ({
        id: gym.id,
        distance: haversineKm(
          { lat: gym.lat, lon: gym.lon },
          { lat: userLocation.lat, lng: userLocation.lng },
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2)
      .map((entry) => entry.id);
  }, [filteredGyms, userLocation, nearMeActive]);

  const mapUserLocation = nearMeActive && userLocation ? userLocation : null;
  const filtersActive = useMemo(
    () => searchTerm.trim().length > 0 || selectedBoroughs.length > 0,
    [searchTerm, selectedBoroughs],
  );

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 flex flex-col px-6 py-6">
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-[48px] border-t-[3px] border-l-[3px] border-b-[3px] border-r-0 border-t-[#002776] border-l-[#009739] border-b-[#B43A3A] bg-slate-950/70 shadow-[0_45px_90px_-50px_rgba(8,15,35,0.85)] backdrop-blur">
          <div className="relative flex-1 min-h-0 overflow-hidden rounded-[38px] border border-[#002776]/35 bg-slate-950/30 shadow-inner">
            <div className="absolute inset-0">
              <MapView
                gyms={filteredGyms}
                radiusMiles={radius}
                showRings={showRings}
                fillOpacity={opacity}
                mapStyle={mapStyle}
                userLocation={mapUserLocation}
                highlightedGymIds={highlightedGymIds}
                selectedGym={safeSelectedGym}
                onGymFocus={setSelectedGym}
                showHeatmap={showHeatmap}
                showBoroughHighlights={showBoroughHighlights}
                showGymMarkers={showGymMarkers}
                boroughFeatureCollection={boroughFeatures ?? undefined}
              />
            </div>

            <div className="pointer-events-none absolute inset-0 p-6">
              <div className="pointer-events-auto absolute bottom-6 left-6 right-6 z-[940] flex flex-col gap-3 sm:left-auto sm:right-6 sm:w-auto sm:max-w-full sm:items-end">
                <GymList
                  gyms={filteredGyms}
                  userLocation={userLocation}
                  onUserLocation={setUserLocation}
                  onActiveChange={setNearMeActive}
                  selectedGymId={safeSelectedGym?.id ?? null}
                  onSelectGym={setSelectedGym}
                />
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  {!filtersOpen ? (
                    <button
                      type="button"
                      onClick={() => setFiltersOpen(true)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#002776] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-slate-900/60 transition hover:bg-[#0f3f9c] focus:outline-none focus:ring-2 focus:ring-[#009739]/50 focus:ring-offset-2 focus:ring-offset-slate-950 sm:w-auto"
                    >
                      <span aria-hidden="true">☰</span>
                      Filters
                      {filtersActive ? (
                        <span
                          className="ml-1 inline-flex h-2 w-2 rounded-full bg-[#FFCC29]"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  ) : null}
                  <NearMeButton
                    onLocate={handleNearMeLocate}
                    onError={handleNearMeError}
                    className="w-full bg-[#FFCC29] px-5 py-2 text-sm uppercase tracking-wide text-[#002776] shadow-lg shadow-[#FFCC29]/40 transition hover:bg-[#f6bb12] focus:outline-none focus:ring-2 focus:ring-[#009739]/60 focus:ring-offset-2 focus:ring-offset-slate-950 sm:w-auto"
                  >
                    Gyms near me
                  </NearMeButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filtersOpen ? (
        <button
          type="button"
          aria-label="Close filters"
          onClick={() => setFiltersOpen(false)}
          className="fixed inset-0 z-[940] bg-slate-950/60 backdrop-blur-sm transition-opacity lg:hidden"
        />
      ) : null}

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
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        showHeatmap={showHeatmap}
        setShowHeatmap={setShowHeatmap}
        showBoroughHighlights={showBoroughHighlights}
        setShowBoroughHighlights={setShowBoroughHighlights}
        showGymMarkers={showGymMarkers}
        setShowGymMarkers={setShowGymMarkers}
      />

      {loading || geodataLoading ? (
        <div className="pointer-events-none fixed top-20 right-6 z-[900] space-y-2">
          {loading ? (
            <div className="rounded-xl bg-slate-900/85 px-3 py-2 text-sm font-semibold text-[#FFCC29] shadow-lg shadow-black/40 backdrop-blur">
              Loading gyms…
            </div>
          ) : null}
          {geodataLoading ? (
            <div className="rounded-xl bg-slate-900/85 px-3 py-2 text-sm font-semibold text-emerald-300 shadow-lg shadow-black/40 backdrop-blur">
              Loading map overlays…
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="fixed top-24 left-1/2 z-[900] -translate-x-1/2 rounded-xl bg-[#B43A3A]/90 px-4 py-2 text-sm text-white shadow-lg">
          {error}
        </div>
      ) : null}

      {geodataError ? (
        <div className="fixed top-36 left-1/2 z-[900] -translate-x-1/2 rounded-xl bg-[#B43A3A]/90 px-4 py-2 text-sm text-white shadow-lg">
          {geodataError}
        </div>
      ) : null}
    </div>
  );
}
