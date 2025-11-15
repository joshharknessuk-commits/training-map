import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { createIngestLogger } from './logger';
import { gyms } from './schema';

const schema = { gyms };

const dbLogger = createIngestLogger('drizzle');

let pool: Pool | undefined;
let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

const createPool = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not configured. Please set it before running the scraper.',
    );
  }
  return new Pool({
    connectionString,
    max: 5,
  });
};

export const getIngestDb = () => {
  if (!db) {
    pool = pool ?? createPool();
    db = drizzle(pool, { schema });
    dbLogger.info('initialized drizzle connection');
  }
  return db;
};

export const closeIngestDb = async () => {
  if (pool) {
    await pool.end();
    pool = undefined;
    db = undefined;
    dbLogger.info('closed drizzle connection');
  }
};

export type IngestDb = ReturnType<typeof getIngestDb>;
export const ingestionSchema = schema;
