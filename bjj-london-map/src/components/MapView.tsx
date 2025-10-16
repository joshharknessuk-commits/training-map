import { useMemo } from 'react';
import { GeoJSON, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import type { Feature, Polygon } from '@turf/turf';
import { getCircle } from '../lib/turf';
import type { Gym } from '../types/osm';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIconRetinaUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});

const LONDON_COORDS: [number, number] = [51.5074, -0.1278];
const RING_COLOR = '#0ea5e9';

interface MapViewProps {
  gyms: Gym[];
  radiusMiles: number;
  showRings: boolean;
  fillOpacity: number;
}

export function MapView({ gyms, radiusMiles, showRings, fillOpacity }: MapViewProps) {
  const rings = useMemo(() => {
    if (!showRings) {
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
      className="h-full w-full"
      preferCanvas
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {rings.map(({ id, feature }) => (
        <GeoJSON
          key={`ring-${id}`}
          data={feature as Feature<Polygon>}
          style={{
            color: RING_COLOR,
            weight: 1,
            opacity: 0.7,
            fillColor: RING_COLOR,
            fillOpacity,
          }}
        />
      ))}

      {gyms.map((gym) => (
        <Marker key={gym.id} position={[gym.lat, gym.lon]}>
          <Popup>
            <div className="space-y-2">
              <div className="font-semibold text-slate-900">{gym.name}</div>
              {gym.website ? (
                <a
                  className="block text-sm text-sky-600 underline"
                  href={gym.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Website
                </a>
              ) : null}
              <a
                className="block text-sm text-slate-600 underline"
                href={gym.osmUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in OpenStreetMap
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
