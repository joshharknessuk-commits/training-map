import fs from 'fs/promises';
import path from 'path';
import { config as loadEnv } from 'dotenv';
import ky from 'ky';
import { Client } from 'pg';
import type { Gym } from '@/types/osm';

loadEnv({ path: path.resolve(process.cwd(), '.env.local'), override: false });
loadEnv();

interface RawGym {
  id: number;
  name: string;
  nearestTransport?: string;
  borough?: string;
  websites: string[];
  nameVariants: string[];
}

interface DbGym extends Gym {
  extraWebsites?: string[];
  nearestTransport?: string;
  borough?: string;
}

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'bjj-london-map/1.0 (contact: support@bjj-london-map.local)';

const LONDON_BOUNDS = {
  south: 51.2613,
  west: -0.563,
  north: 51.7377,
  east: 0.3036,
};


const URL_PATTERN = /^(https?:\/\/|www\.)/i;
const DOMAIN_PATTERN = /^[a-z0-9.-]+\.[a-z]{2,}(\/[\w.-]*)*/i;

function looksLikeUrl(value: string): boolean {
  return URL_PATTERN.test(value) || DOMAIN_PATTERN.test(value);
}

function parseCsv(content: string): Omit<RawGym, 'id'>[] {
  const lines = content.split(/\r?\n/);
  const entries: Omit<RawGym, 'id'>[] = [];
  let current: {
    name: string;
    nearestTransport?: string;
    borough?: string;
    websiteParts: string[];
  } | null = null;

  const flush = () => {
    if (!current) {
      return;
    }

    const normalizedName = normalizeWhitespace(current.name);
    if (normalizedName.toLowerCase() === 'club name') {
      current = null;
      return;
    }

    const websites = Array.from(
      new Set(
        current.websiteParts
          .map(normalizeUrl)
          .filter((value): value is string => Boolean(value)),
      ),
    );

    entries.push({
      name: normalizedName,
      nearestTransport: current.nearestTransport
        ? normalizeWhitespace(current.nearestTransport)
        : undefined,
      borough: current.borough ? normalizeWhitespace(current.borough) : undefined,
      websites,
      nameVariants: createNameVariants(normalizedName),
    });

    current = null;
  };

  for (const line of lines) {
    const columns = line.split('\t').map((value) => value.trim());
    const hasContent = columns.some((value) => value.length > 0);
    if (!hasContent) {
      continue;
    }

    const [col0, col1, col2, ...rest] = columns;

    if (col0) {
      flush();
      current = {
        name: col0,
        nearestTransport: col1 || undefined,
        borough: col2 || undefined,
        websiteParts: [],
      };

      [...rest].forEach((value) => {
        if (value && looksLikeUrl(value)) {
          current?.websiteParts.push(value);
        }
      });
      continue;
    }

    if (!current) {
      continue;
    }

    if (col1 && !current.nearestTransport) {
      current.nearestTransport = col1;
    }

    if (col2 && !current.borough) {
      current.borough = col2;
    }

    const potentialWebsites = [col1, col2, ...rest].filter(
      (value): value is string => Boolean(value) && looksLikeUrl(value),
    );
    potentialWebsites.forEach((value) => current?.websiteParts.push(value));
  }

  flush();

  return entries.filter((entry) => !/^https?:/i.test(entry.name));
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

const KEYWORD_STRIP_REGEX = /\b(bjj|brazilian|jiu|jitsu|jiu[-\s]*jitsu|academy|mma|martial|arts|grappling|gym|club|team|dojo|studio|school|fight|fighting)\b/gi;

function sanitizeVariant(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function stripKeywords(name: string): string {
  return sanitizeVariant(name.replace(KEYWORD_STRIP_REGEX, ' '));
}

function createNameVariants(name: string): string[] {
  const variants = new Set<string>();
  const normalized = normalizeName(name);
  if (normalized) {
    variants.add(normalized);
  }

  const stripped = stripKeywords(name);
  if (stripped) {
    variants.add(stripped);
  }

  const noParentheses = name.replace(/\([^)]*\)/g, '').trim();
  if (noParentheses !== name) {
    variants.add(normalizeName(noParentheses));
    const strippedNoParentheses = stripKeywords(noParentheses);
    if (strippedNoParentheses) {
      variants.add(strippedNoParentheses);
    }
  }

  const hyphenSplit = name.split(' - ');
  if (hyphenSplit.length > 1) {
    variants.add(normalizeName(hyphenSplit[0]));
    const strippedHyphen = stripKeywords(hyphenSplit[0]);
    if (strippedHyphen) {
      variants.add(strippedHyphen);
    }
  }

  const slashSplit = name.split('/');
  if (slashSplit.length > 1) {
    slashSplit.forEach((part) => {
      variants.add(normalizeName(part));
      const strippedPart = stripKeywords(part);
      if (strippedPart) {
        variants.add(strippedPart);
      }
    });
  }

  const colonSplit = name.split(':');
  if (colonSplit.length > 1) {
    variants.add(normalizeName(colonSplit[0]));
    const strippedColon = stripKeywords(colonSplit[0]);
    if (strippedColon) {
      variants.add(strippedColon);
    }
  }

  return Array.from(variants).filter(Boolean);
}

async function geocodeGym(gym: RawGym): Promise<
  | {
      lat: number;
      lon: number;
      osmUrl: string;
      displayName: string;
    }
  | null
> {
  const queryCandidates: string[] = [];

  if (gym.nearestTransport) {
    queryCandidates.push(`${gym.nearestTransport} station, London, UK`);
    queryCandidates.push(`${gym.nearestTransport}, London, UK`);
  }

  if (gym.borough) {
    queryCandidates.push(`${gym.name}, ${gym.borough}, London, UK`);
    queryCandidates.push(`${gym.name}, ${gym.borough}, UK`);
  }

  queryCandidates.push(
    `${gym.name}, Brazilian Jiu Jitsu, London, UK`,
    `${gym.name}, BJJ, London, UK`,
    `${gym.name}, London, UK`,
    `${gym.name}, UK`,
  );

  const uniqueQueries = Array.from(new Set(queryCandidates.filter((query) => query.length > 0)));

  for (const query of uniqueQueries) {
    try {
      const response = await ky
        .get(NOMINATIM_ENDPOINT, {
          searchParams: {
            q: query,
            format: 'json',
            limit: '1',
            addressdetails: '0',
          },
          headers: {
            'User-Agent': USER_AGENT,
          },
          timeout: 30_000,
        })
        .json<
          Array<{
            lat: string;
            lon: string;
            osm_id: number;
            osm_type: 'node' | 'way' | 'relation';
            display_name: string;
          }>
        >();

      if (!response.length) {
        continue;
      }

      const [result] = response;
      const lat = Number.parseFloat(result.lat);
      const lon = Number.parseFloat(result.lon);

      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        continue;
      }

      const osmType =
        result.osm_type === 'way' || result.osm_type === 'relation' ? result.osm_type : 'node';
      const osmUrl = `https://www.openstreetmap.org/${osmType}/${result.osm_id}`;

      return {
        lat,
        lon,
        osmUrl,
        displayName: result.display_name,
      };
    } catch (error) {
      console.warn(
        `[geocode] query "${query}" failed for "${gym.name}": ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  return null;
}

function normalizeUrl(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
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

async function ensureTables(client: Client): Promise<void> {
  await client.query(`
    create table if not exists gyms_raw (
      id serial primary key,
      name text not null,
      nearest_transport text,
      borough text,
      website text,
      extra_websites text[],
      inserted_at timestamptz default now()
    );
  `);

  await client.query(`
    alter table gyms_raw
      add column if not exists nearest_transport text,
      add column if not exists borough text,
      add column if not exists website text,
      add column if not exists extra_websites text[];
  `);

  await client.query(`
    create table if not exists gyms (
      id text primary key,
      name text not null,
      lat double precision not null,
      lon double precision not null,
      nearest_transport text,
      borough text,
      website text,
      extra_websites text[],
      osm_url text not null,
      tags jsonb not null default '{}'::jsonb,
      updated_at timestamptz not null default now()
    );
  `);

  await client.query(`
    alter table gyms
      add column if not exists lat double precision,
      add column if not exists lon double precision,
      add column if not exists nearest_transport text,
      add column if not exists borough text,
      add column if not exists website text,
      add column if not exists extra_websites text[],
      add column if not exists osm_url text,
      add column if not exists tags jsonb default '{}'::jsonb,
      add column if not exists updated_at timestamptz default now();
  `);

  await client.query(`
    alter table gyms
      alter column id type text using id::text;
  `);
}

async function buildDbGyms(rawGyms: RawGym[]): Promise<{ gyms: DbGym[]; unmatched: RawGym[] }> {
  const gyms: DbGym[] = [];
  const unmatched: RawGym[] = [];

  for (let index = 0; index < rawGyms.length; index += 1) {
    const raw = rawGyms[index];
    const geo = await geocodeGym(raw);

    if (!geo) {
      unmatched.push(raw);
    } else {
      const [primaryWebsite, ...restWebsites] = raw.websites;
      gyms.push({
        id: `raw-${raw.id}`,
        name: raw.name,
        lat: geo.lat,
        lon: geo.lon,
        tags: {
          source: 'nominatim',
          display_name: geo.displayName,
        },
        osmUrl: geo.osmUrl,
        website: primaryWebsite ?? undefined,
        extraWebsites: restWebsites.length > 0 ? restWebsites : undefined,
        nearestTransport: raw.nearestTransport,
        borough: raw.borough,
      });
    }

    if (index + 1 < rawGyms.length) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
  }

  return { gyms, unmatched };
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Add it to your .env.local file.');
  }

  const csvPath = path.join(process.cwd(), 'data', 'map-data.csv');
  const csvContent = await fs.readFile(csvPath, 'utf8');
  const parsedGyms = parseCsv(csvContent);
  console.log(`Parsed ${parsedGyms.length} gyms from CSV.`);
  const stagedGymsData: RawGym[] = parsedGyms.map((gym, index) => ({
    id: index + 1,
    ...gym,
  }));

  let stagingClient: Client | null = null;

  try {
    stagingClient = new Client({ connectionString });
    await stagingClient.connect();
    await ensureTables(stagingClient);

    await stagingClient.query('BEGIN');
    await stagingClient.query('TRUNCATE TABLE gyms_raw;');

    for (const [index, gym] of stagedGymsData.entries()) {
      const [primaryWebsite, ...extraWebsites] = gym.websites;
      await stagingClient.query(
        `
          INSERT INTO gyms_raw (name, nearest_transport, borough, website, extra_websites)
          VALUES ($1, $2, $3, $4, $5);
        `,
        [
          gym.name,
          gym.nearestTransport ?? null,
          gym.borough ?? null,
          primaryWebsite ?? null,
          extraWebsites.length > 0 ? extraWebsites : null,
        ],
      );
      if ((index + 1) % 50 === 0) {
        console.log(`Inserted ${index + 1} gyms into staging...`);
      }
    }

    await stagingClient.query('COMMIT');
    console.log(`Staged ${parsedGyms.length} gyms into gyms_raw.`);
  } catch (error) {
    if (stagingClient) {
      await stagingClient.query('ROLLBACK').catch(() => null);
    }
    throw error;
  } finally {
    await stagingClient?.end().catch(() => null);
  }

  const { gyms, unmatched } = await buildDbGyms(stagedGymsData);
  console.log(`Geocoded ${gyms.length} gyms.`);

  if (unmatched.length > 0) {
    console.warn(
      `Warning: ${unmatched.length} staged gyms could not be geocoded. Example: ${unmatched[0]?.name}`,
    );
    console.warn(
      `Unmatched gyms: ${unmatched
        .slice(0, 10)
        .map((gym) => gym.name)
        .join(', ')}${unmatched.length > 10 ? '…' : ''}`,
    );
  }

  const nameCounts = new Map<string, number>();
  gyms.forEach((gym) => {
    const count = nameCounts.get(gym.name) ?? 0;
    nameCounts.set(gym.name, count + 1);
  });

  const disambiguatedGyms = gyms.map((gym, index) => {
    const count = nameCounts.get(gym.name) ?? 0;
    if (count <= 1) {
      return gym;
    }

    const qualifier = gym.borough ?? gym.nearestTransport ?? `location-${index + 1}`;
    return {
      ...gym,
      name: `${gym.name} (${qualifier})`,
    };
  });

  let writeClient: Client | null = null;

  try {
    writeClient = new Client({ connectionString });
    await writeClient.connect();

    await writeClient.query('BEGIN');
    await writeClient.query('TRUNCATE TABLE gyms;');

    for (const [index, gym] of disambiguatedGyms.entries()) {
      await writeClient.query(
        `
          INSERT INTO gyms (
            id,
            name,
            lat,
            lon,
            nearest_transport,
            borough,
            website,
            extra_websites,
            osm_url,
            tags,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, now())
          ON CONFLICT (id) DO UPDATE SET
            name = excluded.name,
            lat = excluded.lat,
            lon = excluded.lon,
            nearest_transport = excluded.nearest_transport,
            borough = excluded.borough,
            website = excluded.website,
            extra_websites = excluded.extra_websites,
            osm_url = excluded.osm_url,
            tags = excluded.tags,
            updated_at = now();
        `,
        [
          gym.id,
          gym.name,
          gym.lat,
          gym.lon,
          gym.nearestTransport ?? null,
          gym.borough ?? null,
          gym.website ?? null,
          gym.extraWebsites ?? null,
          gym.osmUrl,
          JSON.stringify(gym.tags),
        ],
      );

      if ((index + 1) % 50 === 0) {
        console.log(`Upserted ${index + 1} gyms into gyms table...`);
      }
    }

    await writeClient.query('TRUNCATE TABLE gyms_raw;');
    await writeClient.query('COMMIT');
    console.log(`Finished syncing ${gyms.length} gyms. Staging table cleared.`);
  } catch (error) {
    if (writeClient) {
      await writeClient.query('ROLLBACK').catch(() => null);
    }
    throw error;
  } finally {
    await writeClient?.end().catch(() => null);
  }
}

main().catch((error) => {
  console.error('Failed to sync gyms:', error);
  process.exitCode = 1;
});
