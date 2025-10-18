'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import type { Feature, Polygon } from '@turf/turf';
import type { CircleMarker as LeafletCircleMarker, LatLngBounds, Map as LeafletMap } from 'leaflet';
import Supercluster from 'supercluster';
import type { ClusterFeature, PointFeature } from 'supercluster';
import type { Gym } from '@/types/osm';
import { getCircle } from '@/lib/turf';
import { ClaimButton } from '@/components/ClaimButton';
import { haversineKm } from '@/lib/distance';

const LONDON_COORDS: [number, number] = [51.5074, -0.1278];
const CLUSTER_ZOOM_THRESHOLD = 11;
const RING_OUTLINE = '#009c3b';
const RING_FILL = '#ffdf00';
const MARKER_BORDER = '#002776';
const MARKER_FILL = '#009c3b';

interface MapViewProps {
  gyms: Gym[];
  radiusMiles: number;
  showRings: boolean;
  fillOpacity: number;
  mapStyle: {
    id: string;
    url: string;
    attribution: string;
  };
  userLocation?: { lat: number; lng: number } | null;
  highlightedGymIds?: string[];
  selectedGym?: Gym | null;
  onGymFocus?: (gym: Gym) => void;
}

interface ViewportState {
  zoom: number;
  bounds: LatLngBounds | null;
}

interface GymPointProperties {
  cluster: false;
  gymId: string;
  name: string;
}

type ClusterPoint =
  | PointFeature<GymPointProperties>
  | ClusterFeature<Supercluster.AnyProps>;

const INITIAL_VIEWPORT: ViewportState = {
  zoom: 10,
  bounds: null,
};

export function MapView({
  gyms,
  radiusMiles,
  showRings,
  fillOpacity,
  mapStyle,
  userLocation,
  highlightedGymIds,
  selectedGym,
  onGymFocus,
}: MapViewProps) {
  const [viewport, setViewport] = useState<ViewportState>(INITIAL_VIEWPORT);
  const [debouncedZoom, setDebouncedZoom] = useState(INITIAL_VIEWPORT.zoom);
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [hoveredClusterId, setHoveredClusterId] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markerRefs = useRef<Map<string, LeafletCircleMarker>>(new Map());
  const shouldCluster = viewport.zoom <= CLUSTER_ZOOM_THRESHOLD;
  const highlightedIds = useMemo(
    () => new Set(highlightedGymIds ?? []),
    [highlightedGymIds],
  );
  const selectedGymId = selectedGym?.id ?? null;

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedZoom(viewport.zoom);
    }, 120);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [viewport.zoom]);

  const handleViewportChange = useCallback((next: ViewportState) => {
    setViewport(next);
  }, []);

  const handleMapReady = useCallback((map: LeafletMap) => {
    setMapInstance(map);
  }, []);

  useEffect(() => {
    if (!mapInstance || !userLocation) {
      return;
    }

    const targetZoom = Math.max(mapInstance.getZoom(), 12);
    mapInstance.flyTo([userLocation.lat, userLocation.lng], targetZoom, { duration: 0.6 });
  }, [mapInstance, userLocation]);

  useEffect(() => {
    if (!mapInstance || !selectedGym) {
      return;
    }

    const targetZoom = Math.max(mapInstance.getZoom(), 13);
    mapInstance.flyTo([selectedGym.lat, selectedGym.lon], targetZoom, { duration: 0.6 });
  }, [mapInstance, selectedGym]);

  useEffect(() => {
    if (!selectedGymId) {
      markerRefs.current.forEach((marker) => {
        marker.closePopup();
      });
      return;
    }

    const marker = markerRefs.current.get(selectedGymId);
    if (marker) {
      marker.openPopup();
      return;
    }

    const timer = window.setTimeout(() => {
      const nextMarker = markerRefs.current.get(selectedGymId);
      if (nextMarker) {
        nextMarker.openPopup();
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [selectedGymId, shouldCluster]);

  const gymIndex = useMemo(() => new Map(gyms.map((gym) => [gym.id, gym])), [gyms]);

  const geoPoints = useMemo<PointFeature<GymPointProperties>[]>(() => {
    return gyms.map((gym) => ({
      type: 'Feature',
      properties: {
        cluster: false,
        gymId: gym.id,
        name: gym.name,
      },
      geometry: {
        type: 'Point',
        coordinates: [gym.lon, gym.lat],
      },
    }));
  }, [gyms]);

  const clusterIndex = useMemo(() => {
    if (geoPoints.length === 0) {
      return null;
    }

    const index = new Supercluster<GymPointProperties, Supercluster.AnyProps>({
      radius: 60,
      maxZoom: 17,
      minPoints: 3,
    });

    index.load(geoPoints);
    return index;
  }, [geoPoints]);

  const clusterFeatures = useMemo<ClusterPoint[]>(() => {
    if (!clusterIndex) {
      return [];
    }

    const bounds = viewport.bounds;
    const bbox: [number, number, number, number] = bounds
      ? [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]
      : [-180, -85, 180, 85];

    return clusterIndex.getClusters(bbox, Math.round(debouncedZoom)) as ClusterPoint[];
  }, [clusterIndex, viewport.bounds, debouncedZoom]);

  const rings = useMemo(() => {
    if (!showRings || radiusMiles <= 0 || shouldCluster) {
      return [];
    }

    return gyms.map((gym) => ({
      id: gym.id,
      feature: getCircle(gym.lon, gym.lat, radiusMiles),
    }));
  }, [gyms, radiusMiles, showRings, shouldCluster]);

  const handleClusterClick = useCallback(
    (clusterId: number, coordinates: [number, number]) => {
      if (!mapInstance || !clusterIndex) {
        return;
      }

      const targetZoom = clusterIndex.getClusterExpansionZoom(clusterId);
      const [lon, lat] = coordinates;
      mapInstance.flyTo([lat, lon], Math.min(targetZoom, 16), { duration: 0.6 });
    },
    [clusterIndex, mapInstance],
  );

  const registerMarker = useCallback(
    (id: string) => (marker: LeafletCircleMarker | null) => {
      if (marker) {
        markerRefs.current.set(id, marker);
      } else {
        markerRefs.current.delete(id);
      }
    },
    [],
  );

  const renderGymPopupContent = (gym: Gym, distanceKm: number | null) => {
    return (
      <div className="min-w-[260px] max-w-[280px] rounded-3xl bg-slate-950/95 p-4 text-slate-100 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.95)] backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#ffdf00]">
              Gym details
            </p>
            <h3 className="mt-1 text-base font-semibold leading-tight text-white">{gym.name}</h3>
          </div>
        </div>

        <dl className="mt-3 space-y-2 text-sm">
          {distanceKm !== null ? (
            <div className="flex items-center justify-between rounded-2xl border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-blue-100">
              <dt className="flex items-center gap-2 font-semibold">
                <span aria-hidden="true">📏</span>
                Distance
              </dt>
              <dd>{distanceKm.toFixed(1)} km away</dd>
            </div>
          ) : null}
          {gym.nearestTransport ? (
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70">
                <span aria-hidden="true">🚇</span>
                Nearest
              </dt>
              <dd className="text-sm text-white/80">{gym.nearestTransport}</dd>
            </div>
          ) : null}
          {gym.borough ? (
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70">
                <span aria-hidden="true">🏷️</span>
                Borough
              </dt>
              <dd className="text-sm text-white/80">{gym.borough}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-4 space-y-2 text-sm">
          {gym.website ? (
            <a
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#ffdf00]/60"
              href={gym.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden="true">🌐</span>
              Visit website
            </a>
          ) : null}
          {gym.extraWebsites?.map((url) => (
            <a
              key={url}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#ffdf00]/40"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden="true">🔗</span>
              Additional link
            </a>
          ))}
          <a
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ffdf00]/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900 transition hover:bg-[#ffdf00]"
            href={`https://www.google.com/maps/dir/?api=1&destination=${gym.lat},${gym.lon}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span aria-hidden="true">🧭</span>
            Directions
          </a>
          <ClaimButton gymId={gym.id} gymName={gym.name} />
          <a
            className="block text-center text-xs text-white/50 underline underline-offset-2 transition hover:text-white/80"
            href={gym.osmUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in OpenStreetMap
          </a>
        </div>
      </div>
    );
  };

  const renderGymMarker = (gym: Gym) => {
    const isHighlighted = highlightedIds.has(gym.id);
    const isSelected = selectedGymId === gym.id;
    const distanceKm =
      userLocation != null
        ? haversineKm(
            { lat: gym.lat, lon: gym.lon },
            { lat: userLocation.lat, lng: userLocation.lng },
          )
        : null;

    return (
      <CircleMarker
        key={gym.id}
        ref={registerMarker(gym.id)}
        center={[gym.lat, gym.lon]}
        pane="markers"
        radius={isSelected ? 11 : isHighlighted ? 9.5 : 8}
        color={isSelected ? '#f97316' : isHighlighted ? '#1d4ed8' : MARKER_BORDER}
        weight={isSelected ? 3 : isHighlighted ? 2.5 : 2}
        fillColor={isSelected ? '#fb923c' : isHighlighted ? '#38bdf8' : MARKER_FILL}
        fillOpacity={isSelected ? 1 : isHighlighted ? 1 : 0.95}
        eventHandlers={
          onGymFocus
            ? {
                click: () => onGymFocus(gym),
              }
            : undefined
        }
      >
        <Popup className="!p-0">{renderGymPopupContent(gym, distanceKm)}</Popup>
      </CircleMarker>
    );
  };

  return (
    <MapContainer
      center={LONDON_COORDS}
      zoom={INITIAL_VIEWPORT.zoom}
      minZoom={8}
      maxZoom={17}
      scrollWheelZoom
      zoomControl={false}
      className="h-full w-full rounded-[32px] border border-white/10 shadow-2xl drop-shadow-xl"
      preferCanvas
    >
      <MapPanesInitializer />
      <MapViewportWatcher onViewportChange={handleViewportChange} onReady={handleMapReady} />
      <TileLayer key={mapStyle.id} attribution={mapStyle.attribution} url={mapStyle.url} />
      <ZoomControl position="topright" />

      {userLocation ? (
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          pane="user-location"
          radius={10}
          color="#2563eb"
          weight={2}
          fillColor="#2563eb"
          fillOpacity={0.25}
          interactive={false}
        >
          <Tooltip
            permanent
            direction="top"
            offset={[0, -10]}
            className="!bg-blue-600 !text-white !border-none !rounded-full !px-3 !py-1 !text-xs !font-semibold !shadow-lg"
          >
            You are here
          </Tooltip>
        </CircleMarker>
      ) : null}

      {rings.map(({ id, feature }) => (
        <GeoJSON
          key={`ring-${id}-${radiusMiles.toFixed(2)}`}
          data={feature as Feature<Polygon>}
          pane="rings"
          interactive={false}
          style={{
            color: RING_OUTLINE,
            weight: 1.5,
            opacity: 0.8,
            fillColor: RING_FILL,
            fillOpacity,
          }}
        />
      ))}

      {shouldCluster && clusterIndex
        ? clusterFeatures.map((feature) => {
            const [lon, lat] = feature.geometry.coordinates as [number, number];
            const properties = feature.properties as Record<string, unknown>;

            if (properties.cluster && typeof feature.id === 'number') {
              const clusterId = feature.id;
              const pointCount = (properties.point_count as number) ?? 0;
              const abbreviated = (properties.point_count_abbreviated as string) ?? `${pointCount}`;
              const baseRadius = Math.max(18, Math.min(40, 12 + Math.sqrt(pointCount) * 4));
              const radius = hoveredClusterId === clusterId ? baseRadius * 1.12 : baseRadius;

              const previewLeaves = clusterIndex.getLeaves(clusterId, 6, 0) as PointFeature<GymPointProperties>[];
              const previewGyms = previewLeaves
                .map((leaf) => gymIndex.get(leaf.properties.gymId))
                .filter((gym): gym is Gym => Boolean(gym));
              const remaining = Math.max(0, pointCount - previewGyms.length);

              return (
                <CircleMarker
                  key={`cluster-${clusterId}`}
                  center={[lat, lon]}
                  pane="markers"
                  radius={radius}
                  color={MARKER_BORDER}
                  weight={2}
                  fillColor={MARKER_FILL}
                  fillOpacity={0.9}
                  eventHandlers={{
                    click: () => handleClusterClick(clusterId, [lon, lat]),
                    mouseover: () => setHoveredClusterId(clusterId),
                    mouseout: () => setHoveredClusterId(null),
                  }}
                >
                  <Tooltip
                    permanent
                    direction="center"
                    className="!bg-[#002776] !text-white !border-none !shadow-lg !rounded-full !px-3 !py-1 !font-semibold !tracking-wide !text-xs"
                  >
                    {abbreviated}
                  </Tooltip>
                  <Popup>
                    <div className="space-y-2 text-sm">
                      <div className="font-semibold text-[#002776]">Gyms in this area</div>
                      <div className="text-xs text-slate-600">{pointCount} gyms grouped here</div>
                      <ul className="max-h-40 space-y-1 overflow-y-auto pr-1 text-xs text-slate-600">
                        {previewGyms.map((gym) => (
                          <li key={gym.id} className="truncate">
                            {gym.name}
                          </li>
                        ))}
                        {remaining > 0 ? (
                          <li className="truncate text-slate-500">+ {remaining} more…</li>
                        ) : null}
                      </ul>
                      <p className="text-xs text-slate-500">Zoom in to view individual gym details.</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            }

            const gymIdValue = typeof properties.gymId === 'string' ? properties.gymId : null;
            const gym = gymIdValue ? gymIndex.get(gymIdValue) : undefined;
            if (!gym) {
              return null;
            }

            return renderGymMarker(gym);
          })
        : gyms.map((gym) => {
            return renderGymMarker(gym);
          })}
    </MapContainer>
  );
}

function MapPanesInitializer(): null {
  const map = useMap();

  useEffect(() => {
    const ensurePane = (name: string, zIndex: string, pointerEvents?: string) => {
      const pane = map.getPane(name) ?? map.createPane(name);
      pane.style.zIndex = zIndex;
      if (pointerEvents) {
        pane.style.pointerEvents = pointerEvents;
      }
    };

    ensurePane('rings', '350', 'none');
    ensurePane('markers', '400');
    ensurePane('user-location', '425', 'none');
  }, [map]);

  return null;
}

function MapViewportWatcher({
  onViewportChange,
  onReady,
}: {
  onViewportChange: (state: ViewportState) => void;
  onReady: (map: LeafletMap) => void;
}): null {
  const map = useMapEvents({
    moveend: () => {
      onViewportChange({ zoom: map.getZoom(), bounds: map.getBounds() });
    },
    zoomend: () => {
      onViewportChange({ zoom: map.getZoom(), bounds: map.getBounds() });
    },
  });

  useEffect(() => {
    onReady(map);
    onViewportChange({ zoom: map.getZoom(), bounds: map.getBounds() });
  }, [map, onReady, onViewportChange]);

  return null;
}
