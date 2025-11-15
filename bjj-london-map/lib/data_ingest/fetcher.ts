import { setTimeout as delay } from 'node:timers/promises';
import { getRetryDelay, dataIngestConfig, pickUserAgent } from './config';
import { createIngestLogger } from './logger';
import type { PageFetchResult } from './types';

const fetcherLogger = createIngestLogger('http-fetcher');

export class HttpFetcher {
  #lastRequestAt = 0;

  /**
   * TODO: Swap this simple fetcher with Playwright for pages that require JS execution.
   */
  async fetch(url: string): Promise<PageFetchResult> {
    const { maxRetries, timeoutMs } = dataIngestConfig.request;
    const errors: string[] = [];
    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      await this.applyRateLimit();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        const response = await fetch(url, {
          headers: {
            'user-agent': pickUserAgent(),
            accept: 'text/html,*/*',
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const html = await response.text();
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return {
          url,
          html,
          status: response.status,
          strategy: 'http',
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(message);
        fetcherLogger.warn(
          { url, attempt, error: error instanceof Error ? error.message : String(error) },
          'fetch attempt failed',
        );
        if (attempt === maxRetries) {
          return {
            url,
            error: message,
            errors,
            strategy: 'http',
          };
        }
        await delay(getRetryDelay(attempt));
      }
    }
    return { url, error: 'exhausted retries', errors, strategy: 'http' };
  }

  private async applyRateLimit() {
    const { minIntervalMs } = dataIngestConfig.request.rateLimit;
    const now = Date.now();
    const elapsed = now - this.#lastRequestAt;
    if (elapsed < minIntervalMs) {
      await delay(minIntervalMs - elapsed);
    }
    this.#lastRequestAt = Date.now();
  }
}

export const createHttpFetcher = () => new HttpFetcher();
