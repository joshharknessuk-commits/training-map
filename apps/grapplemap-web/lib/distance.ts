const EARTH_RADIUS_KM = 6371;

export interface Coordinate {
  lat: number;
  lon?: number;
  lng?: number;
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const getLongitude = ({ lon, lng }: Coordinate) => {
  if (typeof lon === 'number') {
    return lon;
  }

  if (typeof lng === 'number') {
    return lng;
  }

  throw new Error('Coordinate is missing a longitude value (lon or lng).');
};

export function haversineKm(a: Coordinate, b: Coordinate): number {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const lon1 = toRadians(getLongitude(a));
  const lon2 = toRadians(getLongitude(b));

  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;

  const sinLat = Math.sin(deltaLat / 2);
  const sinLon = Math.sin(deltaLon / 2);

  const haversine =
    sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;

  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return EARTH_RADIUS_KM * centralAngle;
}
