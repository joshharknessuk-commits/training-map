import { drizzle } from 'drizzle-orm/node-postgres';
import { getPool, db as sharedDb } from '@grapplemap/db';
import { createIngestLogger } from './logger';
import { gyms } from './schema';

const schema = { gyms };

const dbLogger = createIngestLogger('drizzle');

let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export const getIngestDb = () => {
  if (!db) {
    // Use the centralized pool from @grapplemap/db
    const pool = getPool();
    db = drizzle(pool, { schema });
    dbLogger.info('initialized drizzle connection using centralized pool');
  }
  return db;
};

export const closeIngestDb = async () => {
  if (db) {
    // Use the centralized db's end method
    await sharedDb.end();
    db = undefined;
    dbLogger.info('closed drizzle connection');
  }
};

export type IngestDb = ReturnType<typeof getIngestDb>;
export const ingestionSchema = schema;
