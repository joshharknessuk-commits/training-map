import { Pool, type PoolConfig, type QueryResult, type QueryResultRow } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
}

let pool: Pool | undefined = global.__dbPool;

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not configured. Please add it to your environment (e.g. .env.local or the Vercel dashboard).',
    );
  }

  const config: PoolConfig = {
    connectionString,
    max: 10,
  };

  const instance = new Pool(config);

  if (process.env.NODE_ENV !== 'production') {
    global.__dbPool = instance;
  }

  return instance;
}

function getPool(): Pool {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

export const db = {
  query: async <T extends QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> => {
    return getPool().query<T>(text, params);
  },
  end: async () => {
    if (pool) {
      await pool.end();
      pool = undefined;
      if (process.env.NODE_ENV !== 'production') {
        global.__dbPool = undefined;
      }
    }
  },
};
