import { HttpFetcher, createHttpFetcher } from './fetcher';
import { BrowserFetcher } from './browserFetcher';
import { createIngestLogger } from './logger';
import { normalizeContacts } from './normalizers';
import { extractEmails, extractKeywords, extractPhones } from './extractors';
import type {
  GymSeed,
  KeywordDetection,
  PageFetchResult,
  ScrapeResponse,
} from './types';

const scraperLogger = createIngestLogger('scraper');
const emptyKeywords = (): KeywordDetection => ({});

interface ScraperDeps {
  fetcher?: HttpFetcher;
  browserFetcher?: BrowserFetcher;
}

export class GymScraper {
  #fetcher: HttpFetcher;
  #browserFetcher?: BrowserFetcher;

  constructor(deps: ScraperDeps = {}) {
    this.#fetcher = deps.fetcher ?? createHttpFetcher();
    this.#browserFetcher = deps.browserFetcher;
  }

  async scrapeContacts(gym: GymSeed): Promise<ScrapeResponse> {
    if (!gym.website) {
      return {
        data: {
          gym,
          contacts: { emails: [], phones: [] },
          keywords: emptyKeywords(),
          fetchedAt: new Date().toISOString(),
        },
        failed: true,
        failureReason: 'missing website',
      };
    }

    const fetchResult = await this.fetchPage(gym.website);
    if (!fetchResult.html) {
      return {
        data: {
          gym,
          contacts: { emails: [], phones: [] },
          keywords: emptyKeywords(),
          fetchedAt: new Date().toISOString(),
          sourceUrl: gym.website,
          errors: fetchResult.errors ?? (fetchResult.error ? [fetchResult.error] : undefined),
        },
        failed: true,
        failureReason: fetchResult.error ?? 'no html response',
      };
    }

    const emails = extractEmails(fetchResult.html);
    const phones = extractPhones(fetchResult.html);
    const keywords = extractKeywords(fetchResult.html);
    const contacts = normalizeContacts({ emails, phones });

    scraperLogger.info(
      {
        gymId: gym.id,
        emailCount: contacts.emails.length,
        phoneCount: contacts.phones.length,
        strategy: fetchResult.strategy ?? 'http',
      },
      'scraped contact details',
    );

    return {
      data: {
        gym,
        contacts,
        keywords,
        fetchedAt: new Date().toISOString(),
        sourceUrl: gym.website,
        errors: fetchResult.errors ?? undefined,
      },
      rawHtmlLength: fetchResult.html.length,
    };
  }

  private async fetchPage(url: string): Promise<PageFetchResult> {
    const httpResult = await this.#fetcher.fetch(url);
    if (httpResult.html || !this.#browserFetcher) {
      return httpResult;
    }

    scraperLogger.info(
      { url, reason: httpResult.error },
      'http fetch failed, attempting browser fallback',
    );

    const browserResult = await this.#browserFetcher.fetch(url);
    if (browserResult.html) {
      return browserResult;
    }

    const errors = [
      ...(httpResult.errors ?? (httpResult.error ? [httpResult.error] : [])),
      ...(browserResult.errors ?? (browserResult.error ? [browserResult.error] : [])),
    ];

    return {
      url,
      error: errors.join('; ') || 'browser fallback failed',
      errors,
      strategy: browserResult.strategy ?? 'browser',
    };
  }
}

export const createGymScraper = (deps?: ScraperDeps) => new GymScraper(deps);

/**
 * TODO: Extend the scraper to parse head coaches, affiliations, and structured LD+JSON.
 */
