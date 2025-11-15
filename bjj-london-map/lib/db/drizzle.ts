import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { getPool } from '@/lib/db';

let cachedDb: NodePgDatabase | null = null;

export function getDrizzleDb(): NodePgDatabase {
  if (!cachedDb) {
    cachedDb = drizzle(getPool());
  }
  return cachedDb;
}
