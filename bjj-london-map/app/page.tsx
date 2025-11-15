'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import dynamic from 'next/dynamic';
import { Controls } from '@/components/Controls';
import { GymList } from '@/components/GymList';
import { NearMeButton } from '@/components/NearMeButton';
import { ContactButton } from '@/components/ContactButton';
import { MobileActionBar } from '@/components/MobileActionBar';
import { useGyms } from '@/state/useGyms';
import { useGeodata } from '@/state/useGeodata';
import { DEFAULT_MAP_STYLE_INDEX, MAP_STYLES } from '@/app/config/mapStyles';
import { haversineKm } from '@/lib/distance';
import type { Gym } from '@/types/osm';

type LayoutVars = CSSProperties & { '--header-offset'?: string };

const MapView = dynamic(() => import('@/components/MapView').then((mod) => mod.MapView), {
  ssr: false,
});

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showBoroughHighlights, setShowBoroughHighlights] = useState(false);
  const [showGymMarkers, setShowGymMarkers] = useState(true);
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerOffset, setHeaderOffset] = useState<string>('calc(3rem + env(safe-area-inset-top))');
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

  useEffect(() => {
    const element = headerRef.current;
    if (!element) {
      return;
    }

    const updateOffset = () => {
      setHeaderOffset(`${element.getBoundingClientRect().height}px`);
    };

    updateOffset();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(updateOffset);
      observer.observe(element);
    }

    window.addEventListener('resize', updateOffset);
    window.addEventListener('orientationchange', updateOffset);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateOffset);
      window.removeEventListener('orientationchange', updateOffset);
    };
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

  const headerStatus = useMemo(() => {
    if (error) {
      return <span className="font-medium text-rose-300">{error}</span>;
    }

    if (loading) {
      return <span className="text-slate-300">Loading gym data…</span>;
    }

    if (totalCount === 0) {
      return <span className="text-slate-400">No gyms available right now.</span>;
    }

    return (
      <span className="text-slate-300">
        {shownCount} of {totalCount} gyms displayed
      </span>
    );
  }, [error, loading, shownCount, totalCount]);

  const headerVariables = useMemo<LayoutVars>(
    () => ({ '--header-offset': headerOffset }),
    [headerOffset],
  );

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100" style={headerVariables}>
      <header
        ref={headerRef}
        className="box-border fixed top-0 left-0 right-0 z-[980] flex flex-col gap-2 border-b border-slate-800/70 bg-slate-900/85 px-4 py-2 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="space-y-0.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-sky-300">
            Grapple Map
          </p>
          <p className="text-sm font-semibold text-slate-100">London BJJ Gyms</p>
        </div>
        <div className="min-w-0 text-xs leading-tight text-slate-300 sm:text-right">
          {headerStatus}
        </div>
      </header>

      <main className="relative" style={{ paddingTop: 'var(--header-offset, 3rem)' }}>
        <div
          className="relative w-full"
          style={{
            height: 'calc(100dvh - var(--header-offset, 3rem))',
            minHeight: 'calc(100vh - var(--header-offset, 3rem))',
          }}
        >
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
              showZoomControl={!filtersOpen}
            />
          </div>
          <div className="pointer-events-none absolute inset-0">
            <div
              className="pointer-events-auto absolute left-4 z-[950] sm:hidden"
              style={{ top: 'calc(var(--header-offset, 3rem) + 0.2rem)' }}
            >
              <button
                type="button"
                onClick={() => setFiltersOpen((prev) => !prev)}
                aria-pressed={filtersOpen}
                aria-label={filtersOpen ? 'Hide filters' : 'Show filters'}
                className={`group inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#002776]/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white shadow-[0_10px_20px_rgba(0,0,0,0.45)] transition hover:bg-[#0f3f9c]/90 focus:outline-none focus:ring-2 focus:ring-white/30 ${
                  filtersOpen ? 'opacity-95' : 'opacity-80'
                }`}
              >
                <span aria-hidden="true" className="text-sm leading-none text-white/75 group-hover:text-white">
                  {filtersOpen ? '–' : '☰'}
                </span>
                <span>Filters</span>
                {filtersActive ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFCC29]" aria-hidden="true" />
                ) : null}
              </button>
            </div>
            <div
              className="pointer-events-auto absolute left-4 right-4 z-[940] flex flex-col gap-4 sm:left-auto sm:right-4 sm:w-auto sm:max-w-full sm:items-end"
              style={{ bottom: 'var(--mobile-map-control-offset)', paddingBottom: 'var(--safe-area-bottom)' }}
            >
              <GymList
                gyms={filteredGyms}
                userLocation={userLocation}
                onUserLocation={setUserLocation}
                onActiveChange={setNearMeActive}
                selectedGymId={safeSelectedGym?.id ?? null}
                onSelectGym={setSelectedGym}
              />
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
                {!filtersOpen ? (
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(true)}
                    className="hidden w-full items-center justify-center gap-2 rounded-full bg-[#002776] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-slate-900/60 transition hover:bg-[#0f3f9c] focus:outline-none focus:ring-2 focus:ring-[#009739]/50 focus:ring-offset-2 focus:ring-offset-slate-950 sm:inline-flex sm:w-auto"
                  >
                    <span aria-hidden="true">☰</span>
                    Filters
                    {filtersActive ? (
                      <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-[#FFCC29]" aria-hidden="true" />
                    ) : null}
                  </button>
                ) : null}
                <div className="hidden w-full flex-col gap-3 sm:flex sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  <ContactButton
                    buttonClassName="min-h-[48px] w-full justify-center rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-wide sm:w-auto"
                  />
                  <NearMeButton
                    onLocate={handleNearMeLocate}
                    onError={handleNearMeError}
                    className="min-h-[48px] w-full bg-[#FFCC29] px-5 py-2 text-sm uppercase tracking-wide text-[#002776] shadow-lg shadow-[#FFCC29]/40 transition hover:bg-[#f6bb12] focus:outline-none focus:ring-2 focus:ring-[#009739]/60 focus:ring-offset-2 focus:ring-offset-slate-950 sm:w-auto"
                  >
                    Gyms near me
                  </NearMeButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileActionBar onLocate={handleNearMeLocate} onError={handleNearMeError} />

      {filtersOpen ? (
        <button
          type="button"
          aria-label="Close filters"
          onClick={() => setFiltersOpen(false)}
          className="fixed inset-0 z-[920] bg-slate-950/60 backdrop-blur-sm transition-opacity lg:hidden"
          style={{ top: 'var(--header-offset, 3rem)' }}
        />
      ) : null}

      {loading || geodataLoading ? (
        <div className="pointer-events-none fixed top-24 right-6 z-[900] space-y-2">
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
        <div className="fixed top-28 left-1/2 z-[900] -translate-x-1/2 rounded-xl bg-[#B43A3A]/90 px-4 py-2 text-sm text-white shadow-lg">
          {error}
        </div>
      ) : null}

      {geodataError ? (
        <div className="fixed top-36 left-1/2 z-[900] -translate-x-1/2 rounded-xl bg-[#B43A3A]/90 px-4 py-2 text-sm text-white shadow-lg">
          {geodataError}
        </div>
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
    </div>
  );
}
