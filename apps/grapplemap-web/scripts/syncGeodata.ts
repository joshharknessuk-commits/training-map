import path from 'path';
import { config as loadEnv } from 'dotenv';
import { Client } from 'pg';
import type { ParsedFeature } from '@/lib/geodata/loaders';
import {
  loadAncientWoodlands,
  loadBattlefields,
  loadLocalAuthorityDistricts,
} from '@/lib/geodata/loaders';
import { copyFrom } from 'pg-copy-streams';
import { finished } from 'stream/promises';

loadEnv({ path: path.resolve(process.cwd(), '.env.local'), override: false });
loadEnv();

async function ensureTables(client: Client) {
  await client.query(`
    create table if not exists local_authority_districts (
      id text primary key,
      name text not null,
      feature jsonb not null,
      centroid jsonb,
      dataset text,
      prefix text,
      reference text,
      updated_at timestamptz default now()
    );
  `);

  await client.query(`
    create table if not exists ancient_woodlands (
      id text primary key,
      name text not null,
      feature jsonb not null,
      centroid jsonb,
      dataset text,
      status text,
      documentation_url text,
      notes text,
      updated_at timestamptz default now()
    );
  `);

  await client.query(`
    create table if not exists battlefields (
      id text primary key,
      name text not null,
      feature jsonb not null,
      centroid jsonb,
      dataset text,
      documentation_url text,
      document_url text,
      start_date date,
      wikidata text,
      wikipedia text,
      updated_at timestamptz default now()
    );
  `);
}

const escapeCopyValue = (value: string): string =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\t/g, '\\t')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');

function formatRow(values: Array<string | null | undefined>): string {
  const formatted = values
    .map((value) => {
      if (value === null || value === undefined || value === '') {
        return '\\N';
      }
      return escapeCopyValue(String(value));
    })
    .join('\t');
  return `${formatted}\n`;
}

async function syncLocalAuthorities(client: Client, features: ParsedFeature[]) {
  await client.query('TRUNCATE TABLE local_authority_districts;');

  const stream = client.query(
    copyFrom(
      `COPY local_authority_districts (id, name, feature, centroid, dataset, prefix, reference) FROM STDIN WITH (FORMAT text)`,
    ),
  );

  for (const entry of features) {
    const row = [
      entry.id,
      entry.name,
      JSON.stringify(entry.feature),
      entry.centroid ? JSON.stringify(entry.centroid) : null,
      entry.dataset ?? null,
      entry.feature.properties?.prefix ?? null,
      entry.feature.properties?.id ?? null,
    ];
    stream.write(formatRow(row));
  }

  stream.end();
  await finished(stream);

  console.log(`Synced ${features.length} local authority districts.`);
}

async function syncAncientWoodlands(client: Client, features: ParsedFeature[]) {
  await client.query('TRUNCATE TABLE ancient_woodlands;');

  const stream = client.query(
    copyFrom(
      `COPY ancient_woodlands (id, name, feature, centroid, dataset, status, documentation_url, notes) FROM STDIN WITH (FORMAT text)`,
    ),
  );

  for (const entry of features) {
    const row = [
      entry.id,
      entry.name,
      JSON.stringify(entry.feature),
      entry.centroid ? JSON.stringify(entry.centroid) : null,
      entry.dataset ?? null,
      entry.feature.properties?.status ?? null,
      entry.feature.properties?.documentationUrl ?? null,
      entry.feature.properties?.notes ?? null,
    ];
    stream.write(formatRow(row));
  }

  stream.end();
  await finished(stream);

  console.log(`Synced ${features.length} ancient woodland features.`);
}

async function syncBattlefields(client: Client, features: ParsedFeature[]) {
  await client.query('TRUNCATE TABLE battlefields;');

  const stream = client.query(
    copyFrom(
      `COPY battlefields (id, name, feature, centroid, dataset, documentation_url, document_url, start_date, wikidata, wikipedia, notes) FROM STDIN WITH (FORMAT text)`,
    ),
  );

  for (const entry of features) {
    const row = [
      entry.id,
      entry.name,
      JSON.stringify(entry.feature),
      entry.centroid ? JSON.stringify(entry.centroid) : null,
      entry.dataset ?? null,
      entry.feature.properties?.documentationUrl ?? null,
      entry.feature.properties?.documentUrl ?? null,
      entry.feature.properties?.startDate ?? null,
      entry.feature.properties?.wikidata ?? null,
      entry.feature.properties?.wikipedia ?? null,
      entry.feature.properties?.notes ?? null,
    ];
    stream.write(formatRow(row));
  }

  stream.end();
  await finished(stream);

  console.log(`Synced ${features.length} battlefield features.`);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Add it to your .env.local file to sync geodata.');
  }

  const [localAuthorities, woodlands, battlefields] = await Promise.all([
    loadLocalAuthorityDistricts(),
    loadAncientWoodlands(),
    loadBattlefields(),
  ]);

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await ensureTables(client);
    await client.query('SET statement_timeout TO 0');
    await client.query('SET idle_in_transaction_session_timeout TO 0');

    await syncLocalAuthorities(client, localAuthorities);
    await syncAncientWoodlands(client, woodlands);
    await syncBattlefields(client, battlefields);
  } catch (error) {
    console.error('Failed to sync geospatial datasets.', error);
    throw error;
  } finally {
    await client.end().catch(() => null);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
