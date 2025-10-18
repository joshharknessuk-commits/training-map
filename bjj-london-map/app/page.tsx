'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Controls } from '@/components/Controls';
import { GymList } from '@/components/GymList';
import { useGyms } from '@/state/useGyms';
import { DEFAULT_MAP_STYLE_INDEX, MAP_STYLES } from '@/app/config/mapStyles';
import { haversineKm } from '@/lib/distance';
import type { Gym } from '@/types/osm';
import { GymMicroInfoCard } from '@/components/GymMicroInfoCard';

const MapView = dynamic(() => import('@/components/MapView').then((mod) => mod.MapView), {
  ssr: false,
});

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [hoveredGym, setHoveredGym] = useState<Gym | null>(null);
  const [cardGym, setCardGym] = useState<Gym | null>(null);
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

  const safeSelectedGym = useMemo(() => {
    if (!selectedGym) {
      return null;
    }
    return filteredGyms.find((gym) => gym.id === selectedGym.id) ?? null;
  }, [filteredGyms, selectedGym]);

  const previewGym = safeSelectedGym ?? hoveredGym;

  useEffect(() => {
    if (selectedGym && !safeSelectedGym) {
      setSelectedGym(null);
    }
  }, [safeSelectedGym, selectedGym]);

  useEffect(() => {
    if (!hoveredGym) {
      return;
    }

    const stillExists = filteredGyms.some((gym) => gym.id === hoveredGym.id);
    if (!stillExists) {
      setHoveredGym(null);
    }
  }, [filteredGyms, hoveredGym]);

  useEffect(() => {
    if (previewGym) {
      setCardGym(previewGym);
      return;
    }

    const timer = window.setTimeout(() => {
      setCardGym(null);
    }, 220);

    return () => {
      window.clearTimeout(timer);
    };
  }, [previewGym]);

  const previewDistanceKm = useMemo(() => {
    if (!cardGym || !userLocation) {
      return null;
    }

    return haversineKm(
      { lat: cardGym.lat, lon: cardGym.lon },
      { lat: userLocation.lat, lng: userLocation.lng },
    );
  }, [cardGym, userLocation]);

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

  const handleSelectGym = useCallback((gym: Gym | null) => {
    setSelectedGym(gym);
    if (!gym) {
      setHoveredGym(null);
    }
  }, []);

  const handleGymPreviewChange = useCallback((gym: Gym | null, source: 'hover' | 'click') => {
    if (source === 'hover') {
      setHoveredGym(gym);
      return;
    }

    if (source === 'click' && gym) {
      setHoveredGym(null);
    }
  }, []);

  const handleClosePreview = useCallback(() => {
    setHoveredGym(null);
    setSelectedGym(null);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
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
          onGymFocus={handleSelectGym}
          onGymPreviewChange={handleGymPreviewChange}
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

      <div className="absolute bottom-6 right-6 z-[930] flex max-w-full justify-end">
        <GymList
          gyms={filteredGyms}
          userLocation={userLocation}
          onUserLocation={setUserLocation}
          onActiveChange={setNearMeActive}
          selectedGymId={safeSelectedGym?.id ?? null}
          onSelectGym={handleSelectGym}
        />
      </div>

      <div className="pointer-events-none absolute bottom-28 left-1/2 z-[920] w-full max-w-md -translate-x-1/2 px-4">
        <GymMicroInfoCard
          gym={cardGym}
          visible={Boolean(previewGym)}
          distanceKm={previewDistanceKm}
          onClose={handleClosePreview}
        />
      </div>

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
