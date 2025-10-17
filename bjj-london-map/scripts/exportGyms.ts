import fs from 'fs/promises';
import path from 'path';
import { config as loadEnv } from 'dotenv';
import { db } from '@/lib/db';

loadEnv({ path: path.resolve(process.cwd(), '.env.local'), override: false });
loadEnv();

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
  tags: Record<string, unknown> | null;
  updated_at: string | null;
}

async function main(): Promise<void> {
  const result = await db.query<GymRow>(`
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
  `);

  const gyms = result.rows.map((row) => ({
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

  const outputPath = path.join(process.cwd(), 'public', 'gyms.json');
  const json = `${JSON.stringify(gyms, null, 2)}\n`;
  await fs.writeFile(outputPath, json, 'utf8');
  await db.end();
}

main().catch((error) => {
  console.error('[exportGyms] Failed to export gyms:', error);
  process.exitCode = 1;
});
