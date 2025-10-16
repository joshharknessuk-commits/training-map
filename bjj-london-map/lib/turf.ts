import { circle, type Feature, type Polygon } from '@turf/turf';

const circleCache = new Map<string, Feature<Polygon>>();

export function getCircle(lon: number, lat: number, miles: number): Feature<Polygon> {
  const key = `${lon.toFixed(6)},${lat.toFixed(6)},${miles.toFixed(2)}`;
  const cached = circleCache.get(key);
  if (cached) {
    return cached;
  }

  const geometry = circle([lon, lat], miles, {
    steps: 128,
    units: 'miles',
  });

  circleCache.set(key, geometry);
  return geometry;
}

export function clearCircles(): void {
  circleCache.clear();
}
