import { promises as fs } from 'node:fs';
import { dataIngestConfig } from './config';
import { createIngestLogger } from './logger';
import type { GymEnrichmentResult } from './types';

const storageLogger = createIngestLogger('storage');

export const intermediatePaths = dataIngestConfig.storage;

export const ensureIntermediateStorage = async () => {
  await fs.mkdir(intermediatePaths.intermediateDir, { recursive: true });
};

export const writeIntermediateResults = async (data: GymEnrichmentResult[]) => {
  await ensureIntermediateStorage();
  await fs.writeFile(
    intermediatePaths.enrichedGymsPath,
    JSON.stringify(data, null, 2),
    'utf8',
  );
  storageLogger.info(
    { count: data.length, file: intermediatePaths.enrichedGymsPath },
    'saved intermediate enrichment payload',
  );
};

export const readIntermediateResults = async (): Promise<GymEnrichmentResult[]> => {
  try {
    const buffer = await fs.readFile(intermediatePaths.enrichedGymsPath, 'utf8');
    return JSON.parse(buffer);
  } catch (error) {
    storageLogger.warn(
      { error: error instanceof Error ? error.message : String(error) },
      'no intermediate file present, starting fresh',
    );
    return [];
  }
};

/**
 * TODO: Add append-only journaling so we can recover from partial failures mid-run.
 */
