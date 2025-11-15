import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config as loadEnv } from 'dotenv';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadEnv({ path: path.resolve(__dirname, '../.env.local'), override: false });
loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not configured. Unable to export gyms.');
}

const pool = new Pool({ connectionString, max: 5 });

const query = `
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
`;

const { rows } = await pool.query(query);

const gyms = rows.map((row) => ({
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

const outputPath = path.join(__dirname, '../public/gyms.json');
await fs.writeFile(outputPath, `${JSON.stringify(gyms, null, 2)}\n`, 'utf8');

await pool.end();
