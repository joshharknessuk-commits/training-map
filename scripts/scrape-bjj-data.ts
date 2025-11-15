import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';
import { createGymScraper } from '../bjj-london-map/lib/data_ingest/scraper';
import { createHttpFetcher } from '../bjj-london-map/lib/data_ingest/fetcher';
import { createBrowserFetcher } from '../bjj-london-map/lib/data_ingest/browserFetcher';
import { createIngestLogger } from '../bjj-london-map/lib/data_ingest/logger';
import {
  writeIntermediateResults,
  readIntermediateResults,
} from '../bjj-london-map/lib/data_ingest/storage';
import { getIngestDb, closeIngestDb } from '../bjj-london-map/lib/data_ingest/drizzle';
import { gyms as gymsTable } from '../bjj-london-map/lib/data_ingest/schema';
import { persistEnrichments } from '../bjj-london-map/lib/data_ingest/persistence';
import type { GymSeed, GymEnrichmentResult } from '../bjj-london-map/lib/data_ingest/types';

dotenv.config();
dotenv.config({ path: path.resolve('bjj-london-map/.env.local') });

const logger = createIngestLogger('cli');

interface CliArgs {
  dryRun: boolean;
  limit?: number;
}

const parseArgs = (): CliArgs => {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find((arg) => arg.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;
  return { dryRun, limit: Number.isNaN(limit) ? undefined : limit };
};

const loadGyms = async (limit?: number): Promise<GymSeed[]> => {
  const db = getIngestDb();
  const query = db
    .select({
      id: gymsTable.id,
      name: gymsTable.name,
      website: gymsTable.website,
      borough: gymsTable.borough,
    })
    .from(gymsTable);

  const rows = limit ? await query.limit(limit) : await query;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    website: row.website ?? undefined,
    borough: row.borough ?? undefined,
  }));
};

const run = async () => {
  const { dryRun, limit } = parseArgs();
  const gyms = await loadGyms(limit);

  logger.info({ total: gyms.length, dryRun }, 'starting scrape run');

  const fetcher = createHttpFetcher();
  const browserFetcher = createBrowserFetcher();
  const scraper = createGymScraper({ fetcher, browserFetcher });
  const previous = await readIntermediateResults();

  const results: GymEnrichmentResult[] = [];

  try {
    for (const gym of gyms) {
      try {
        const response = await scraper.scrapeContacts(gym);
        results.push(response.data);
        if (response.failed) {
          logger.warn(
            { gymId: gym.id, reason: response.failureReason },
            'scrape failed for gym',
          );
        }
      } catch (error) {
        logger.error(
          { gymId: gym.id, error: error instanceof Error ? error.message : error },
          'unexpected scraper error',
        );
      }
    }
  } finally {
    await browserFetcher.close();
  }

  const merged = [...previous.filter((item) => !results.some((r) => r.gym.id === item.gym.id)), ...results];
  await writeIntermediateResults(merged);

  if (dryRun) {
    logger.info(
      { sample: merged.slice(0, 3) },
      'dry-run complete; skipping DB write',
    );
    return;
  }

  const persistSummary = await persistEnrichments(results);
  logger.info(
    persistSummary,
    'persisted enrichment payloads to Neon',
  );
};

run()
  .catch((error) => {
    logger.error(
      { error: error instanceof Error ? error.message : error },
      'scrape run crashed',
    );
    process.exit(1);
  })
  .finally(async () => {
    await closeIngestDb();
  });
