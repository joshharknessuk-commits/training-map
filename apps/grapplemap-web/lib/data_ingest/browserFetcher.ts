import { setTimeout as delay } from 'node:timers/promises';
import { chromium, type Browser } from 'playwright';
import { dataIngestConfig, pickUserAgent } from './config';
import { createIngestLogger } from './logger';
import type { PageFetchResult } from './types';

const browserLogger = createIngestLogger('browser-fetcher');

export class BrowserFetcher {
  #browser: Browser | null = null;
  #lastRequestAt = 0;

  private async ensureBrowser() {
    if (!this.#browser) {
      browserLogger.info('launching playwright chromium');
      this.#browser = await chromium.launch({
        headless: true,
        timeout: dataIngestConfig.request.timeoutMs,
      });
    }
  }

  async fetch(url: string): Promise<PageFetchResult> {
    try {
      await this.ensureBrowser();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to start Playwright browser';
      browserLogger.error({ error: message }, 'unable to initialize browser');
      return { url, error: message, errors: [message], strategy: 'browser' };
    }

    await this.applyRateLimit();

    const page = await this.#browser!.newPage({
      userAgent: pickUserAgent(),
    });

    try {
      const response = await page.goto(url, {
        timeout: dataIngestConfig.request.timeoutMs,
        waitUntil: 'networkidle',
      });
      const html = await page.content();
      return {
        url,
        html,
        status: response?.status(),
        strategy: 'browser',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'browser fetch failed';
      browserLogger.warn({ url, error: message }, 'browser fetch error');
      return { url, error: message, errors: [message], strategy: 'browser' };
    } finally {
      await page.close();
    }
  }

  async close() {
    if (this.#browser) {
      await this.#browser.close();
      this.#browser = null;
    }
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

export const createBrowserFetcher = () => new BrowserFetcher();
