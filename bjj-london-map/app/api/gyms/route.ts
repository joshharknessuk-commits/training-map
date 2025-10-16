import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    const gyms = result.rows.map((row: GymRow) => ({
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
    }));

    return NextResponse.json({ gyms });
  } catch (error) {
    console.error('[api/gyms] Failed to load gyms', error);
    return NextResponse.json({ error: 'Failed to load gyms from database.' }, { status: 500 });
  }
}
