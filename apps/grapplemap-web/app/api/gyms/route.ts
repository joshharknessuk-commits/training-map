import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { poolDb as db } from '@db/pool';

interface GymRow {
  id: string;
  name: string;
  lat: number;
  lon: number;
  nearest_transport: string | null;
  borough: string | null;
  website: string | null;
  extra_websites: string[] | null;
  osm_url: string;
  tags: Record<string, string> | null;
  updated_at: string | null;
}

type NormalizedGym = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  tags: Record<string, unknown>;
  osmUrl: string;
  website?: string;
  extraWebsites?: string[];
  nearestTransport?: string;
  borough?: string;
  updatedAt?: string;
};

function mapRowToGym(row: GymRow): NormalizedGym {
  return {
    id: row.id,
    name: row.name,
    lat: row.lat,
    lon: row.lon,
    tags: row.tags ?? {},
    osmUrl: row.osm_url,
    website: row.website ?? undefined,
    extraWebsites: row.extra_websites ?? undefined,
    nearestTransport: row.nearest_transport ?? undefined,
    borough: row.borough ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

async function loadStaticGyms(): Promise<NormalizedGym[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'gyms.json');
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content) as Array<{
      id: string;
      name: string;
      lat: number;
      lon: number;
      tags?: Record<string, unknown>;
      osmUrl?: string;
      website?: string | null;
      extraWebsites?: string[] | null;
      nearestTransport?: string | null;
      borough?: string | null;
      updatedAt?: string | null;
    }>;

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      lat: Number(row.lat),
      lon: Number(row.lon),
      tags: row.tags ?? {},
      osmUrl: row.osmUrl ?? '',
      website: row.website ?? undefined,
      extraWebsites: row.extraWebsites ?? undefined,
      nearestTransport: row.nearestTransport ?? undefined,
      borough: row.borough ?? undefined,
      updatedAt: row.updatedAt ?? undefined,
    }));
  } catch (error) {
    console.error('[api/gyms] Failed to load static gyms fallback', error);
    return [];
  }
}

export async function GET() {
  try {
    const result = await db.query<GymRow>(
      `
        select
          id,
          name,
          lat,
          lon,
          nearest_transport,
          borough,
          website,
          coalesce(extra_websites, '{}') as extra_websites,
          osm_url,
          tags,
          updated_at
        from gyms
        order by name asc
      `,
    );

    const gyms = result.rows.map(mapRowToGym);

    if (gyms.length > 0) {
      return NextResponse.json({ gyms });
    }
  } catch (error) {
    console.error('[api/gyms] Failed to load gyms', error);
  }

  const fallbackGyms = await loadStaticGyms();
  if (fallbackGyms.length > 0) {
    return NextResponse.json({ gyms: fallbackGyms });
  }

  return NextResponse.json({ error: 'Failed to load gyms from database.' }, { status: 500 });
}
