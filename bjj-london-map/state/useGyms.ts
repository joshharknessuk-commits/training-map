import { useCallback, useEffect, useState } from 'react';
import type { Gym } from '@/types/osm';

const DEFAULT_RADIUS = 1;
const DEFAULT_OPACITY = 0.15;

interface UseGymsState {
  gyms: Gym[];
  filteredGyms: Gym[];
  radius: number;
  setRadius: (value: number) => void;
  opacity: number;
  setOpacity: (value: number) => void;
  showRings: boolean;
  setShowRings: (value: boolean) => void;
  loading: boolean;
  error: string | null;
  totalCount: number;
  shownCount: number;
}

export function useGyms(): UseGymsState {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [opacity, setOpacity] = useState(DEFAULT_OPACITY);
  const [showRings, setShowRings] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGyms = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/gyms');
        if (!response.ok) {
          throw new Error('Request failed');
        }

        const json = (await response.json()) as { gyms?: Gym[] };
        setGyms(json.gyms ?? []);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error ? fetchError.message : 'Unable to load gyms right now.',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadGyms().catch((error) => {
      console.error('Initial load failed', error);
    });
  }, [loadGyms]);

  return {
    gyms,
    filteredGyms: gyms,
    radius,
    setRadius,
    opacity,
    setOpacity,
    showRings,
    setShowRings,
    loading,
    error,
    totalCount: gyms.length,
    shownCount: gyms.length,
  };
}
