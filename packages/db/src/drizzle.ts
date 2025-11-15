import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { getPool } from './pool';

let cachedDb: NodePgDatabase<typeof schema> | null = null;

export function getDrizzleDb(): NodePgDatabase<typeof schema> {
  if (!cachedDb) {
    cachedDb = drizzle(getPool(), { schema });
  }
  return cachedDb;
}
