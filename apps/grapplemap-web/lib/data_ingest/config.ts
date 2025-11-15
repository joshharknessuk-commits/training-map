import path from 'node:path';

/**
 * Central configuration for the ingestion pipeline.
 * TODO: Move the static values (rate limits, UA list) into a persisted config table once we ship the DB writer.
 */
export const dataIngestConfig = {
  userAgents: [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  ],
  request: {
    timeoutMs: 15_000,
    maxRetries: 3,
    retryBackoffMs: 1_500,
    rateLimit: {
      requestsPerMinute: 30,
      minIntervalMs: 1_200,
    },
  },
  storage: {
    intermediateDir: path.resolve(process.cwd(), 'data/intermediate'),
    enrichedGymsPath: path.resolve(
      process.cwd(),
      'data/intermediate/gyms_enriched.json',
    ),
  },
} as const;

export type DataIngestConfig = typeof dataIngestConfig;

export const pickUserAgent = (() => {
  let index = 0;
  return () => {
    index = (index + 1) % dataIngestConfig.userAgents.length;
    return dataIngestConfig.userAgents[index];
  };
})();

export const getRetryDelay = (attempt: number) => {
  return attempt * dataIngestConfig.request.retryBackoffMs;
};
