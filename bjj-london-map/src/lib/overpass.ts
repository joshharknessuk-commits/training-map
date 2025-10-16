import ky from 'ky';
import { z } from 'zod';
import { getWithTTL, setWithTTL } from './storage';
import type { Gym, OverpassElement, OverpassResponse, OsmCoordinate, OsmTags } from '../types/osm';

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';
const OVERPASS_TIMEOUT_MS = 60_000;
const GYM_CACHE_KEY = 'bjj-gyms-v1';
const DAY_MS = 24 * 60 * 60 * 1000;

const gymSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number(),
  lon: z.number(),
  tags: z.record(z.string()),
  osmUrl: z.string().url(),
  website: z.string().url().optional(),
});

const gymsSchema = z.array(gymSchema);

const overpassResponseSchema: z.ZodType<OverpassResponse> = z.object({
  elements: z.array(
    z.object({
      type: z.enum(['node', 'way', 'relation']),
      id: z.number(),
      lat: z.number().optional(),
      lon: z.number().optional(),
      tags: z.record(z.string()).default({}),
      center: z
        .object({
          lat: z.number(),
          lon: z.number(),
        })
        .optional(),
      geometry: z
        .array(
          z.object({
            lat: z.number(),
            lon: z.number(),
          }),
        )
        .optional(),
    }),
  ),
});

const overpassQuery = `
  [out:json][timeout:50];
  area["name"="Greater London"]["boundary"="administrative"]["admin_level"="6"]->.searchArea;
  (
    node["sport"="martial_arts"](area.searchArea);
    way["sport"="martial_arts"](area.searchArea);
    relation["sport"="martial_arts"](area.searchArea);
    node["leisure"="fitness_centre"](area.searchArea);
    way["leisure"="fitness_centre"](area.searchArea);
    relation["leisure"="fitness_centre"](area.searchArea);
    node["leisure"="sports_centre"](area.searchArea);
    way["leisure"="sports_centre"](area.searchArea);
    relation["leisure"="sports_centre"](area.searchArea);
    node["club"="sport"](area.searchArea);
    way["club"="sport"](area.searchArea);
    relation["club"="sport"](area.searchArea);
    node["amenity"="dojo"](area.searchArea);
    way["amenity"="dojo"](area.searchArea);
    relation["amenity"="dojo"](area.searchArea);
  );
  out center tags geom;
`.trim();

const KEYWORD_REGEX =
  /\b(bjj|brazilian\s*jiu[-\s]?jitsu|jiu[-\s]?jitsu|gracie|barra|jiujitsu)\b/i;

export type GymSource = 'cached' | 'overpass';

interface FetchGymsOptions {
  source: GymSource;
}

export async function fetchGyms({ source }: FetchGymsOptions): Promise<Gym[]> {
  if (source === 'cached') {
    const cachedGyms = loadFromLocalStorage();
    if (cachedGyms) {
      return cachedGyms;
    }

    const seededGyms = await loadSeededGyms();
    if (seededGyms.length > 0) {
      setWithTTL(GYM_CACHE_KEY, seededGyms, DAY_MS);
      return seededGyms;
    }
  }

  const gyms = await fetchFromOverpass();
  if (gyms.length > 0) {
    setWithTTL(GYM_CACHE_KEY, gyms, DAY_MS);
  }

  return gyms;
}

function loadFromLocalStorage(): Gym[] | null {
  const cached = getWithTTL<Gym[]>(GYM_CACHE_KEY);
  if (!cached) {
    return null;
  }

  try {
    return gymsSchema.parse(cached);
  } catch (error) {
    console.warn('[overpass] Cached gyms failed validation', error);
    return null;
  }
}

async function loadSeededGyms(): Promise<Gym[]> {
  const baseUrl = import.meta.env.BASE_URL || '/';
  try {
    const response = await ky
      .get(`${baseUrl}gyms.json`, {
        retry: 0,
        cache: 'no-store',
      })
      .json<unknown>();
    return gymsSchema.parse(response);
  } catch (error) {
    console.warn('[overpass] No seeded gyms available', error);
    return [];
  }
}

async function fetchFromOverpass(): Promise<Gym[]> {
  const body = new URLSearchParams({
    data: overpassQuery,
  });

  try {
    const raw = await ky
      .post(OVERPASS_ENDPOINT, {
        body,
        timeout: OVERPASS_TIMEOUT_MS,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      })
      .json<unknown>();

    const parsed = overpassResponseSchema.parse(raw);

    const gyms = parsed.elements
      .map((element) => normalizeElement(element))
      .filter((gym): gym is Gym => Boolean(gym));

    return gymsSchema.parse(gyms);
  } catch (error) {
    console.error('[overpass] Failed to fetch gyms', error);
    throw new Error('Failed to load gyms from Overpass API.');
  }
}

function normalizeElement(element: OverpassElement): Gym | null {
  const tags = extractTags(element.tags);
  if (!isBjjGym(tags)) {
    return null;
  }

  const name = tags.name ?? tags['alt_name'] ?? `BJJ Gym ${element.id}`;
  const point = getCoordinate(element);

  if (!point) {
    return null;
  }

  const website = extractWebsite(tags);

  return {
    id: `${element.type}-${element.id}`,
    name,
    lat: point.lat,
    lon: point.lon,
    tags,
    osmUrl: toOsmUrl(element.type, element.id),
    website,
  };
}

function extractTags(tags: OsmTags | undefined): OsmTags {
  if (!tags) {
    return {};
  }

  return Object.entries(tags).reduce<OsmTags>((acc, [key, value]) => {
    if (typeof value === 'string') {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function extractWebsite(tags: OsmTags): string | undefined {
  const candidates = [tags.website, tags['contact:website'], tags.url, tags.facebook, tags.instagram];

  for (const candidate of candidates) {
    const normalized = normalizeUrl(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
}

function toOsmUrl(type: OverpassElement['type'], id: number): string {
  return `https://www.openstreetmap.org/${type}/${id}`;
}

function getCoordinate(element: OverpassElement): OsmCoordinate | null {
  if (element.type === 'node') {
    return {
      lat: element.lat,
      lon: element.lon,
    };
  }

  if (element.center) {
    return element.center;
  }

  if (element.geometry && element.geometry.length > 0) {
    return averageGeometry(element.geometry);
  }

  return null;
}

function averageGeometry(points: OsmCoordinate[]): OsmCoordinate {
  const totals = points.reduce(
    (acc, point) => {
      acc.lat += point.lat;
      acc.lon += point.lon;
      return acc;
    },
    { lat: 0, lon: 0 },
  );

  const count = points.length || 1;

  return {
    lat: totals.lat / count,
    lon: totals.lon / count,
  };
}

function isBjjGym(tags: OsmTags): boolean {
  const hasRelevantTag =
    tags.sport === 'martial_arts' ||
    tags.leisure === 'fitness_centre' ||
    tags.leisure === 'sports_centre' ||
    tags.club === 'sport' ||
    tags.amenity === 'dojo' ||
    Boolean(tags.martial_art) ||
    Boolean(tags['martial_arts']);

  if (!hasRelevantTag) {
    return false;
  }

  const textFields = [
    tags.name,
    tags['alt_name'],
    tags.brand,
    tags.operator,
    tags.description,
    tags['short_name'],
    tags['official_name'],
    tags.website,
    tags['contact:website'],
    tags.url,
  ];

  const haystack = textFields.filter(Boolean).join(' ');
  if (KEYWORD_REGEX.test(haystack)) {
    return true;
  }

  const martialArt = [tags.martial_art, tags['martial_arts']]
    .filter(Boolean)
    .map((value) => value.toLowerCase())
    .join(' ');

  return Boolean(martialArt.match(/brazilian|bjj|jiu/));
}

function normalizeUrl(raw?: string): string | undefined {
  if (!raw) {
    return undefined;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    return url.href;
  } catch {
    return undefined;
  }
}
