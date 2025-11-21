import { Pool, type PoolConfig, type QueryResult, type QueryResultRow } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __grapplemapDbPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __grapplemapMapDbPool: Pool | undefined;
}

// Main pool for user/network data (uses DATABASE_URL)
let pool: Pool | undefined = global.__grapplemapDbPool;

// Map pool for gym/geodata (uses MAP_DATABASE_URL or falls back to DATABASE_URL)
let mapPool: Pool | undefined = global.__grapplemapMapDbPool;

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
    global.__grapplemapDbPool = instance;
  }

  return instance;
}

function createMapPool(): Pool {
  // Use MAP_DATABASE_URL if available, otherwise fall back to DATABASE_URL
  const connectionString = process.env.MAP_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'MAP_DATABASE_URL or DATABASE_URL is not configured. Please add it to your environment.',
    );
  }

  const config: PoolConfig = {
    connectionString,
    max: 10,
  };

  const instance = new Pool(config);

  if (process.env.NODE_ENV !== 'production') {
    global.__grapplemapMapDbPool = instance;
  }

  return instance;
}

export function getPool(): Pool {
  if (!pool) {
    pool = createPool();
  }

  return pool;
}

export function getMapPool(): Pool {
  if (!mapPool) {
    mapPool = createMapPool();
  }

  return mapPool;
}

// User/network database queries
export const poolDb = {
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
        global.__grapplemapDbPool = undefined;
      }
    }
  },
};

// Map/gym database queries
export const mapDb = {
  query: async <T extends QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> => {
    return getMapPool().query<T>(text, params);
  },
  end: async () => {
    if (mapPool) {
      await mapPool.end();
      mapPool = undefined;
      if (process.env.NODE_ENV !== 'production') {
        global.__grapplemapMapDbPool = undefined;
      }
    }
  },
};
