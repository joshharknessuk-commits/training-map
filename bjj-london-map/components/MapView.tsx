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
import type { LatLngBounds, Map as LeafletMap } from 'leaflet';
import Supercluster from 'supercluster';
import type { ClusterFeature, PointFeature } from 'supercluster';
import type { Gym } from '@/types/osm';
import { getCircle } from '@/lib/turf';
import { ClaimButton } from '@/components/ClaimButton';

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
}: MapViewProps) {
  const [viewport, setViewport] = useState<ViewportState>(INITIAL_VIEWPORT);
  const [debouncedZoom, setDebouncedZoom] = useState(INITIAL_VIEWPORT.zoom);
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [hoveredClusterId, setHoveredClusterId] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldCluster = viewport.zoom <= CLUSTER_ZOOM_THRESHOLD;
  const highlightedIds = useMemo(
    () => new Set(highlightedGymIds ?? []),
    [highlightedGymIds],
  );

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

            const isHighlighted = gym ? highlightedIds.has(gym.id) : false;

            return (
              <CircleMarker
                key={gym.id}
                center={[gym.lat, gym.lon]}
                pane="markers"
                radius={isHighlighted ? 9.5 : 8}
                color={isHighlighted ? '#1d4ed8' : MARKER_BORDER}
                weight={isHighlighted ? 2.5 : 2}
                fillColor={isHighlighted ? '#38bdf8' : MARKER_FILL}
                fillOpacity={isHighlighted ? 1 : 0.95}
              >
                <Popup>
                  <div className="space-y-2 text-sm">
                    <div className="font-semibold text-[#002776]">{gym.name}</div>
                    {(gym.nearestTransport || gym.borough) && (
                      <div className="space-y-1 text-xs text-slate-600">
                        {gym.nearestTransport ? (
                          <div>
                            <span className="font-medium text-[#009c3b]">Nearest:</span>{' '}
                            {gym.nearestTransport}
                          </div>
                        ) : null}
                        {gym.borough ? (
                          <div>
                            <span className="font-medium text-[#009c3b]">Borough:</span> {gym.borough}
                          </div>
                        ) : null}
                      </div>
                    )}
                    {gym.website ? (
                      <a
                        className="block text-[#002776] underline"
                        href={gym.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Website
                      </a>
                    ) : null}
                    {gym.extraWebsites?.map((extra) => (
                      <a
                        key={extra}
                        className="block text-[#002776]/80 underline"
                        href={extra}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Additional link
                      </a>
                    ))}
                    <ClaimButton gymId={gym.id} gymName={gym.name} />
                    <a
                      className="block text-xs text-slate-500 underline"
                      href={gym.osmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open in OpenStreetMap
                    </a>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })
        : gyms.map((gym) => {
            const isHighlighted = highlightedIds.has(gym.id);

            return (
              <CircleMarker
                key={gym.id}
                center={[gym.lat, gym.lon]}
                pane="markers"
                radius={isHighlighted ? 9.5 : 8}
                color={isHighlighted ? '#1d4ed8' : MARKER_BORDER}
                weight={isHighlighted ? 2.5 : 2}
                fillColor={isHighlighted ? '#38bdf8' : MARKER_FILL}
                fillOpacity={isHighlighted ? 1 : 0.95}
              >
                <Popup>
                  <div className="space-y-2 text-sm">
                    <div className="font-semibold text-[#002776]">{gym.name}</div>
                    {(gym.nearestTransport || gym.borough) && (
                      <div className="space-y-1 text-xs text-slate-600">
                        {gym.nearestTransport ? (
                          <div>
                            <span className="font-medium text-[#009c3b]">Nearest:</span>{' '}
                            {gym.nearestTransport}
                          </div>
                        ) : null}
                        {gym.borough ? (
                          <div>
                            <span className="font-medium text-[#009c3b]">Borough:</span>{' '}
                            {gym.borough}
                          </div>
                        ) : null}
                      </div>
                    )}
                    {gym.website ? (
                      <a
                        className="block text-[#002776] underline"
                        href={gym.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Website
                      </a>
                    ) : null}
                    {gym.extraWebsites?.map((extra) => (
                      <a
                        key={extra}
                        className="block text-[#002776]/80 underline"
                        href={extra}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Additional link
                      </a>
                    ))}
                    <ClaimButton gymId={gym.id} gymName={gym.name} />
                    <a
                      className="block text-xs text-slate-500 underline"
                      href={gym.osmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open in OpenStreetMap
                    </a>
                  </div>
                </Popup>
              </CircleMarker>
            );
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
