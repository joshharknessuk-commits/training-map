import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Gym } from '@/types/osm';

export const DEFAULT_RADIUS = 1;
export const DEFAULT_OPACITY = 0.15;

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
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  boroughOptions: Array<{ name: string; count: number }>;
  selectedBoroughs: string[];
  toggleBorough: (name: string) => void;
  clearFilters: () => void;
}

export function useGyms(): UseGymsState {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [opacity, setOpacity] = useState(DEFAULT_OPACITY);
  const [showRings, setShowRings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBoroughs, setSelectedBoroughs] = useState<string[]>([]);

  const loadGyms = useCallback(async () => {
    setLoading(true);
    setError(null);

    const loadStatic = async () => {
      try {
        const response = await fetch('/gyms.json');
        if (!response.ok) {
          return [];
        }

        const json = (await response.json()) as Gym[];
        return Array.isArray(json) ? json : [];
      } catch {
        return [];
      }
    };

    try {
      const response = await fetch('/api/gyms');
      if (!response.ok) {
        throw new Error('Request failed');
      }

      const json = (await response.json()) as { gyms?: Gym[]; error?: string };
      const nextGyms = json.gyms ?? [];

      if (nextGyms.length > 0) {
        setGyms(nextGyms);
        return;
      }

      const fallbackGyms = await loadStatic();
      if (fallbackGyms.length > 0) {
        setGyms(fallbackGyms);
        return;
      }

      setGyms([]);
      if (json.error) {
        setError(json.error);
      }
    } catch (fetchError) {
      const fallbackGyms = await loadStatic();
      if (fallbackGyms.length > 0) {
        setGyms(fallbackGyms);
      } else {
        setError(
          fetchError instanceof Error ? fetchError.message : 'Unable to load gyms right now.',
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGyms().catch((error) => {
      console.error('Initial load failed', error);
    });
  }, [loadGyms]);

  const boroughOptions = useMemo(() => {
    const counts = new Map<string, number>();
    gyms.forEach((gym) => {
      if (gym.borough) {
        counts.set(gym.borough, (counts.get(gym.borough) ?? 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [gyms]);

  const filteredGyms = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const boroughSet = new Set(selectedBoroughs);

    return gyms.filter((gym) => {
      if (query.length > 0) {
        const haystack = `${gym.name} ${gym.nearestTransport ?? ''} ${gym.borough ?? ''}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      if (boroughSet.size > 0) {
        if (!gym.borough || !boroughSet.has(gym.borough)) {
          return false;
        }
      }

      return true;
    });
  }, [gyms, searchTerm, selectedBoroughs]);

  const toggleBorough = useCallback((name: string) => {
    setSelectedBoroughs((prev) => {
      if (prev.includes(name)) {
        return prev.filter((value) => value !== name);
      }
      return [...prev, name];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedBoroughs([]);
  }, []);

  return {
    gyms,
    filteredGyms,
    radius,
    setRadius,
    opacity,
    setOpacity,
    showRings,
    setShowRings,
    loading,
    error,
    totalCount: gyms.length,
    shownCount: filteredGyms.length,
    searchTerm,
    setSearchTerm,
    boroughOptions,
    selectedBoroughs,
    toggleBorough,
    clearFilters,
  };
}
