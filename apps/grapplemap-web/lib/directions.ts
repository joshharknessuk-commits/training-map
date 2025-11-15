/**
 * Builds a Google Maps directions URL for a destination expressed as latitude/longitude.
 * Keeps the formatting logic in one place so UI components can stay focused on rendering.
 */
export function buildDirectionsUrl(
  destination: { lat: number; lon: number },
  origin?: { lat: number; lng: number } | null,
): string {
  const params = new URLSearchParams({
    api: '1',
    destination: `${destination.lat},${destination.lon}`,
  });

  if (origin) {
    params.set('origin', `${origin.lat},${origin.lng}`);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
