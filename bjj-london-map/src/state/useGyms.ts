import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchGyms, type GymSource } from '../lib/overpass';
import type { Gym } from '../types/osm';

const DEFAULT_RADIUS = 1;
const DEFAULT_OPACITY = 0.15;
const DEBOUNCE_MS = 300;

interface UseGymsState {
  gyms: Gym[];
  filteredGyms: Gym[];
  search: string;
  setSearch: (value: string) => void;
  radius: number;
  setRadius: (value: number) => void;
  opacity: number;
  setOpacity: (value: number) => void;
  showRings: boolean;
  setShowRings: (value: boolean) => void;
  source: GymSource;
  setSource: (value: GymSource) => void;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  totalCount: number;
  shownCount: number;
}

export function useGyms(): UseGymsState {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [search, setSearch] = useState('');
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [opacity, setOpacity] = useState(DEFAULT_OPACITY);
  const [showRings, setShowRings] = useState(true);
  const [source, setSourceState] = useState<GymSource>('cached');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadGyms = useCallback(
    async (mode: GymSource) => {
      const id = ++requestId.current;
      setLoading(true);
      setError(null);

      try {
        const data = await fetchGyms({ source: mode });
        if (requestId.current === id) {
          setGyms(data);
        }
      } catch (fetchError) {
        if (requestId.current === id) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Unable to load gyms right now.',
          );
        }
      } finally {
        if (requestId.current === id) {
          setLoading(false);
        }
      }
    },
    [setGyms],
  );

  useEffect(() => {
    loadGyms('cached').catch((error) => {
      console.error('Initial load failed', error);
    });
  }, [loadGyms]);

  const handleSourceChange = useCallback(
    (mode: GymSource) => {
      setSourceState(mode);
      loadGyms(mode).catch((error) => {
        console.error('Source change failed', error);
      });
    },
    [loadGyms],
  );

  const refresh = useCallback(() => {
    setSourceState('overpass');
    loadGyms('overpass').catch((error) => {
      console.error('Refresh failed', error);
    });
  }, [loadGyms]);

  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_MS);

  const filteredGyms = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) {
      return gyms;
    }

    return gyms.filter((gym) => gym.name.toLowerCase().includes(query));
  }, [gyms, debouncedSearch]);

  return {
    gyms,
    filteredGyms,
    search,
    setSearch,
    radius,
    setRadius,
    opacity,
    setOpacity,
    showRings,
    setShowRings,
    source,
    setSource: handleSourceChange,
    loading,
    error,
    refresh,
    totalCount: gyms.length,
    shownCount: filteredGyms.length,
  };
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delay]);

  return debounced;
}
