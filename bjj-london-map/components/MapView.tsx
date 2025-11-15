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
import type { Feature as TurfFeature, Polygon } from '@turf/turf';
import L from 'leaflet';
import 'leaflet.heat';
import type {
  CircleMarker as LeafletCircleMarker,
  LatLngBounds,
  Map as LeafletMap,
  Layer,
  PathOptions,
} from 'leaflet';
import type {
  Feature as GeoJsonFeature,
  FeatureCollection,
  Geometry,
  GeoJsonObject,
  GeoJsonProperties,
} from 'geojson';
import Supercluster from 'supercluster';
import type { ClusterFeature, PointFeature } from 'supercluster';
import type { Gym } from '@/types/osm';
import { getCircle } from '@/lib/turf';
import { ClaimButton } from '@/components/ClaimButton';
import { haversineKm } from '@/lib/distance';
import { buildDirectionsUrl } from '@/lib/directions';

const LONDON_COORDS: [number, number] = [51.5074, -0.1278];
const CLUSTER_ZOOM_THRESHOLD = 11;
const RING_OUTLINE = '#009739';
const RING_FILL = '#FFCC29';
const MARKER_BORDER = '#002776';
const MARKER_FILL = '#009739';
const SINGLE_CLUSTER_DOT_ZOOM_LEVEL = 8;

type HeatmapLatLng = [number, number, number?];

type LeafletHeatLayer = L.Layer & {
  setLatLngs: (latlngs: HeatmapLatLng[]) => LeafletHeatLayer;
};

interface HeatLayerFactory {
  heatLayer: (latlngs: HeatmapLatLng[], options?: HeatLayerOptions) => LeafletHeatLayer;
}

interface HeatLayerOptions {
  radius?: number;
  blur?: number;
  maxZoom?: number;
  minOpacity?: number;
  max?: number;
  gradient?: Record<number, string>;
}

const HEATMAP_GRADIENT: Record<number, string> = {
  0: 'rgba(0,0,0,0)',
  0.07: 'rgba(33,102,172,0.42)',
  0.18: 'rgba(35,139,169,0.52)',
  0.3: 'rgba(65,182,196,0.6)',
  0.45: 'rgba(127,205,187,0.68)',
  0.6: 'rgba(161,218,180,0.75)',
  0.7: 'rgba(199,233,180,0.78)',
  0.78: 'rgba(237,248,177,0.82)',
  0.85: 'rgba(255,255,178,0.84)',
  0.9: 'rgba(254,227,145,0.9)',
  0.95: 'rgba(254,204,92,0.95)',
  1: 'rgba(253,141,60,1)',
};

const leafletWithHeat = L as unknown as typeof L & HeatLayerFactory;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderBoroughPopup = (name: string, count: number): string => {
  const safeName = escapeHtml(name);
  return `
    <div class="min-w-[200px] max-w-[240px] space-y-2 rounded-2xl bg-slate-900/95 px-4 py-3 text-slate-100 shadow-lg">
      <div class="flex items-center gap-2 text-sm font-semibold text-white">
        <span aria-hidden="true">🏙️</span>
        <span>${safeName}</span>
      </div>
      <div class="text-xs text-slate-300">Active gyms in this borough: <span class="font-semibold text-white">${count}</span></div>
      <div class="text-[10px] uppercase tracking-wide text-slate-400">Based on current filter results.</div>
    </div>
  `;
};

function HeatmapOverlay({ gyms }: { gyms: Gym[] }) {
  const map = useMap();
  const layerRef = useRef<LeafletHeatLayer | null>(null);

  const points = useMemo<HeatmapLatLng[]>(() => {
    return gyms.map((gym) => [gym.lat, gym.lon, 1]);
  }, [gyms]);

  useEffect(() => {
    if (!map) {
      return;
    }

    if (points.length === 0) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    if (!layerRef.current) {
      layerRef.current = leafletWithHeat.heatLayer(points, {
        radius: 36,
        blur: 26,
        maxZoom: 17,
        minOpacity: 0.48,
        gradient: HEATMAP_GRADIENT,
      });
      layerRef.current.addTo(map);
    } else {
      layerRef.current.setLatLngs(points);
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, points]);

  return null;
}

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
  showHeatmap?: boolean;
  showBoroughHighlights?: boolean;
  showGymMarkers?: boolean;
  boroughFeatureCollection?: FeatureCollection<Geometry, GeoJsonFeature['properties']>;
  showZoomControl?: boolean;
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
  zoom: 8,
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
  showHeatmap = false,
  showBoroughHighlights = false,
  showGymMarkers = true,
  boroughFeatureCollection,
  showZoomControl = true,
}: MapViewProps) {
  const [viewport, setViewport] = useState<ViewportState>(INITIAL_VIEWPORT);
  const [debouncedZoom, setDebouncedZoom] = useState(INITIAL_VIEWPORT.zoom);
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [hoveredClusterId, setHoveredClusterId] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markerRefs = useRef<Map<string, LeafletCircleMarker>>(new Map());
  const shouldRenderMarkers = showGymMarkers;
  const shouldCluster = shouldRenderMarkers && viewport.zoom <= CLUSTER_ZOOM_THRESHOLD;
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
    if (!selectedGymId || !shouldRenderMarkers) {
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
  }, [selectedGymId, shouldCluster, shouldRenderMarkers]);

  useEffect(() => {
    if (shouldRenderMarkers) {
      return;
    }

    markerRefs.current.forEach((marker) => {
      marker.closePopup();
    });
  }, [shouldRenderMarkers]);

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
    if (!clusterIndex || !shouldRenderMarkers) {
      return [];
    }

    const bounds = viewport.bounds;
    const bbox: [number, number, number, number] = bounds
      ? [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]
      : [-180, -85, 180, 85];

    const zoomLevel = Math.round(debouncedZoom);
    const clusterZoomLevel = zoomLevel <= SINGLE_CLUSTER_DOT_ZOOM_LEVEL ? 0 : zoomLevel;

    return clusterIndex.getClusters(bbox, clusterZoomLevel) as ClusterPoint[];
  }, [clusterIndex, viewport.bounds, debouncedZoom, shouldRenderMarkers]);

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

  const boroughDensity = useMemo(() => {
    const counts = new Map<string, number>();

    gyms.forEach((gym) => {
      if (!gym.borough) {
        return;
      }
      const key = gym.borough.trim().toLowerCase();
      if (!key) {
        return;
      }
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    let max = 0;
    counts.forEach((value) => {
      if (value > max) {
        max = value;
      }
    });

    return { counts, max };
  }, [gyms]);

  const boroughStyle = useCallback<GeoStyleFn>(
    (feature) => {
      const name =
        feature && typeof feature.properties?.name === 'string' ? feature.properties.name : '';
      const key = name.trim().toLowerCase();
      const count = boroughDensity.counts.get(key) ?? 0;
      const intensity = boroughDensity.max > 0 ? count / boroughDensity.max : 0;
      const color =
        intensity >= 0.66 ? '#f97316' : intensity >= 0.33 ? '#facc15' : '#38bdf8';
      const fillOpacity = intensity > 0 ? 0.2 + intensity * 0.35 : 0.08;

      return {
        color,
        weight: intensity > 0 ? 2 : 1,
        fillColor: color,
        fillOpacity,
      };
    },
    [boroughDensity],
  );

  const handleBoroughEachFeature = useCallback(
    (feature: GeoJsonFeature, layer: Layer) => {
      const name = typeof feature.properties?.name === 'string' ? feature.properties.name : 'Unknown borough';
      const key = name.trim().toLowerCase();
      const count = boroughDensity.counts.get(key) ?? 0;
      layer.bindTooltip(`${name}: ${count} gyms`, {
        direction: 'center',
        className: 'borough-tooltip',
        opacity: 0.9,
        sticky: true,
      });
      const popupHtml = renderBoroughPopup(name, count);
      layer.bindPopup(popupHtml, {
        className: 'borough-popup',
        maxWidth: 260,
      });
    },
    [boroughDensity],
  );

  const renderGymPopupContent = (gym: Gym, distanceKm: number | null) => {
    return (
      <div className="min-w-[260px] max-w-[280px] rounded-3xl bg-slate-950/95 p-4 text-slate-100 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.95)] backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#FFCC29]">
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#FFCC29]/60"
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#FFCC29]/40"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden="true">🔗</span>
              Additional link
            </a>
          ))}
          <a
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FFCC29]/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#002776] transition hover:bg-[#f6bb12]"
            href={buildDirectionsUrl({ lat: gym.lat, lon: gym.lon }, userLocation)}
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
      minZoom={4}
      maxZoom={17}
      scrollWheelZoom
      zoomControl={false}
      className="h-full w-full"
      preferCanvas
    >
      <MapPanesInitializer />
      <MapViewportWatcher onViewportChange={handleViewportChange} onReady={handleMapReady} />
      <TileLayer key={mapStyle.id} attribution={mapStyle.attribution} url={mapStyle.url} />
      {showZoomControl ? <ZoomControl position="topright" /> : null}
      {showHeatmap ? <HeatmapOverlay gyms={gyms} /> : null}

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
          data={feature as TurfFeature<Polygon>}
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

      {showBoroughHighlights && boroughFeatureCollection ? (
        <GeoJSON
          key={`boroughs-${gyms.length}-${boroughDensity.max}`}
          data={boroughFeatureCollection as GeoJsonObject}
          style={boroughStyle}
          onEachFeature={handleBoroughEachFeature}
          pane="borough-highlights"
        />
      ) : null}

      {shouldRenderMarkers && shouldCluster && clusterIndex
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
        : shouldRenderMarkers
          ? gyms.map((gym) => {
              return renderGymMarker(gym);
            })
          : null}
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
    ensurePane('borough-highlights', '360');
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
type GeoJsonFeatureWithProps = GeoJsonFeature<Geometry, GeoJsonProperties>;

type GeoStyleFn = (feature: GeoJsonFeatureWithProps | undefined) => PathOptions;
