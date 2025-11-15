import { load } from 'cheerio';

export const normalizeInstagramUrl = (value?: string) => {
  if (!value) {
    return undefined;
  }
  let url = value.trim();
  if (!url) {
    return undefined;
  }
  if (url.startsWith('instagram.com')) {
    url = `https://${url}`;
  }
  if (!url.startsWith('http')) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('instagram.com')) {
      return undefined;
    }
    const [handle] = parsed.pathname.split('/').filter(Boolean);
    if (!handle) {
      return undefined;
    }
    return `https://instagram.com/${handle}`;
  } catch (error) {
    return undefined;
  }
};

const collectLinksFromHtml = (html: string) => {
  const $ = load(html);
  const links = new Set<string>();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      links.add(href);
    }
  });
  return Array.from(links);
};

export const extractInstagram = (input: {
  html?: string;
  links?: string[];
}): { instagram?: string } => {
  const candidates = new Set<string>();
  if (input.links) {
    input.links.forEach((link) => {
      if (link) {
        candidates.add(link);
      }
    });
  }
  if (input.html) {
    collectLinksFromHtml(input.html).forEach((link) => candidates.add(link));
  }

  for (const link of candidates) {
    const normalized = normalizeInstagramUrl(link);
    if (normalized) {
      return { instagram: normalized };
    }
  }

  return {};
};
