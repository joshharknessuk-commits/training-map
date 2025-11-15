import { useEffect, useState } from 'react';
import type { FeatureCollection, Geometry } from 'geojson';

interface GeodataResponse {
  boroughs: FeatureCollection<Geometry> | null;
}

interface GeodataState extends GeodataResponse {
  loading: boolean;
  error: string | null;
}

const initialState: GeodataState = {
  boroughs: null,
  loading: true,
  error: null,
};

export function useGeodata(): GeodataState {
  const [state, setState] = useState<GeodataState>(initialState);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch('/api/geodata');
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const json = (await response.json()) as GeodataResponse;
        if (!cancelled) {
          setState({ ...json, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load geospatial datasets.',
          }));
        }
      }
    };

    load().catch((error) => {
      console.error('Failed to load geodata', error);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
