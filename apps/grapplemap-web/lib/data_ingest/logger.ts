import pino from 'pino';

const level = process.env.DATA_INGEST_LOG_LEVEL ?? 'info';

/**
 * Lightweight logger used across the ingestion pipeline.
 * TODO: Forward these logs to persistent storage (e.g. Logflare or S3) once we add scheduled runs.
 */
export const baseLogger = pino({
  level,
  messageKey: 'message',
  timestamp: pino.stdTimeFunctions.isoTime,
  base: undefined,
});

export const createIngestLogger = (component: string) => {
  return baseLogger.child({ component });
};

export type IngestLogger = ReturnType<typeof createIngestLogger>;
