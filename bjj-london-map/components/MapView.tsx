'use client';

import { useEffect, useMemo } from 'react';
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import type { Feature, Polygon } from '@turf/turf';
import type { Gym } from '@/types/osm';
import { getCircle } from '@/lib/turf';

const LONDON_COORDS: [number, number] = [51.5074, -0.1278];
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
}

export function MapView({ gyms, radiusMiles, showRings, fillOpacity, mapStyle }: MapViewProps) {
  const rings = useMemo(() => {
    if (!showRings || radiusMiles <= 0) {
      return [];
    }

    return gyms.map((gym) => ({
      id: gym.id,
      feature: getCircle(gym.lon, gym.lat, radiusMiles),
    }));
  }, [gyms, radiusMiles, showRings]);

  return (
    <MapContainer
      center={LONDON_COORDS}
      zoom={10}
      minZoom={8}
      maxZoom={17}
      scrollWheelZoom
      className="h-full w-full rounded-[32px] border border-white/10 shadow-2xl drop-shadow-xl"
      preferCanvas
    >
      <MapPanesInitializer />
      <TileLayer key={mapStyle.id} attribution={mapStyle.attribution} url={mapStyle.url} />

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

      {gyms.map((gym) => (
        <CircleMarker
          key={gym.id}
          center={[gym.lat, gym.lon]}
          pane="markers"
          radius={8}
          color={MARKER_BORDER}
          weight={2}
          fillColor={MARKER_FILL}
          fillOpacity={0.95}
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
      ))}
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
  }, [map]);

  return null;
}
