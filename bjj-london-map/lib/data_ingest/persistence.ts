import { setTimeout as delay } from 'node:timers/promises';
import { eq } from 'drizzle-orm';
import { createIngestLogger } from './logger';
import { getIngestDb } from './drizzle';
import { gyms } from './schema';
import type { GymEnrichmentResult } from './types';

const persistenceLogger = createIngestLogger('persistence');
const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = 500;

type GymUpdatePatch = Partial<typeof gyms.$inferInsert>;

const pickFirst = (values: string[]) => values.find((value) => Boolean(value));

const buildPatch = (result: GymEnrichmentResult): GymUpdatePatch => {
  const patch: GymUpdatePatch = {};

  const email = pickFirst(result.contacts.emails);
  if (email) {
    patch.email = email;
  }

  const phone = pickFirst(result.contacts.phones);
  if (phone) {
    patch.phone = phone;
  }

  if (result.address) {
    patch.address = result.address;
  }
  if (result.postcode) {
    patch.postcode = result.postcode;
  }
  if (result.city) {
    patch.city = result.city;
  }
  if (result.headCoach) {
    patch.headCoach = result.headCoach;
  }
  if (result.coaches && result.coaches.length > 0) {
    patch.coaches = result.coaches;
  }
  if (result.affiliation) {
    patch.affiliation = result.affiliation;
  }
  if (result.lineage) {
    patch.lineage = result.lineage;
  }
  if (result.styleFocus) {
    patch.styleFocus = result.styleFocus;
  }
  if (result.instagram) {
    patch.instagram = result.instagram;
  }

  if (result.keywords.gi !== undefined) {
    patch.gi = result.keywords.gi;
  }
  if (result.keywords.nogi !== undefined) {
    patch.nogi = result.keywords.nogi;
  }
  if (result.keywords.openMat !== undefined) {
    patch.openMat = result.keywords.openMat;
  }
  if (result.keywords.dropIn !== undefined) {
    patch.dropIn = result.keywords.dropIn;
  }

  if (Object.keys(patch).length > 0) {
    patch.updatedAt = new Date(result.fetchedAt);
  }

  return patch;
};

export interface PersistSummary {
  attempted: number;
  updated: number;
  skipped: number;
  failures: number;
}

export const persistEnrichments = async (
  results: GymEnrichmentResult[],
): Promise<PersistSummary> => {
  if (!results.length) {
    return { attempted: 0, updated: 0, skipped: 0, failures: 0 };
  }

  const db = getIngestDb();
  let updated = 0;
  let skipped = 0;
  let failures = 0;

  for (const result of results) {
    const patch = buildPatch(result);
    const fieldCount = Object.keys(patch).length;
    if (fieldCount === 0) {
      skipped += 1;
      persistenceLogger.debug(
        { gymId: result.gym.id },
        'no new enrichment fields to persist',
      );
      continue;
    }

    try {
      const persisted = await persistWithRetry(db, result.gym.id, patch);
      if (persisted) {
        updated += 1;
        persistenceLogger.info(
          { gymId: result.gym.id, fields: Object.keys(patch) },
          'persisted enrichment fields',
        );
      } else {
        skipped += 1;
        persistenceLogger.warn(
          { gymId: result.gym.id },
          'no matching gym row found for enrichment',
        );
      }
    } catch (error) {
      failures += 1;
      persistenceLogger.error(
        { gymId: result.gym.id, error: error instanceof Error ? error.message : error },
        'failed to persist enrichment',
      );
    }
  }

  return {
    attempted: results.length,
    updated,
    skipped,
    failures,
  };
};

const persistWithRetry = async (
  db: ReturnType<typeof getIngestDb>,
  gymId: string,
  patch: GymUpdatePatch,
) => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const rows = await db
        .update(gyms)
        .set(patch)
        .where(eq(gyms.id, gymId))
        .returning({ id: gyms.id });
      return rows.length > 0;
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        throw error;
      }
      await delay(RETRY_BACKOFF_MS * attempt);
    }
  }
  return false;
};
