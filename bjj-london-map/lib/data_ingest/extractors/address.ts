import { load } from 'cheerio';
import { collapseWhitespace } from '../normalizers';

export interface AddressParts {
  address?: string;
  city?: string;
  postcode?: string;
}

const postcodeRegex = /[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}/i;
const addressBlockRegex =
  /address[:\s-]+([^:]+?)(?=(?:phone|email|contact|tel|call)\b|$)/i;

const cleanSegment = (value?: string) =>
  value?.replace(/\s{2,}/g, ' ').trim() || undefined;

const formatPostcode = (value?: string) => {
  if (!value) {
    return undefined;
  }
  const normalized = value.toUpperCase().replace(/\s+/g, '');
  if (normalized.length <= 3) {
    return normalized;
  }
  return `${normalized.slice(0, normalized.length - 3)} ${normalized.slice(-3)}`.trim();
};

export const normalizeAddress = (parts: {
  street?: string;
  city?: string;
  postcode?: string;
}): AddressParts => {
  const street = cleanSegment(parts.street);
  const city = cleanSegment(parts.city);
  const postcode = formatPostcode(parts.postcode);
  const segments: string[] = [];

  if (street) {
    segments.push(street);
  }
  const cityPostcode = [city, postcode].filter(Boolean).join(' ').replace(/\s{2,}/g, ' ').trim();
  if (cityPostcode) {
    segments.push(cityPostcode);
  }

  const address = segments.join(', ').trim();

  return {
    address: address || undefined,
    city: city || undefined,
    postcode: postcode || undefined,
  };
};

export const extractAddressFromHtml = (html: string): AddressParts => {
  const $ = load(html);
  const textContent = collapseWhitespace($.text());

  let snippet: string | undefined;
  const blockMatch = addressBlockRegex.exec(textContent);
  if (blockMatch) {
    snippet = blockMatch[1];
  } else {
    const node = $('p, li, div')
      .filter((_, el) => /address/i.test($(el).text()))
      .first();
    if (node.length > 0) {
      snippet = collapseWhitespace(
        node.text().replace(/address[:\s-]*/i, ''),
      );
    }
  }

  const postcodeMatch =
    (snippet && snippet.match(postcodeRegex)) || textContent.match(postcodeRegex);

  let street: string | undefined;
  let city: string | undefined;

  if (snippet) {
    const parts = snippet
      .split(/,|\n|-/)
      .map((value) => value.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      street = parts[0];
    }
    if (parts.length > 1) {
      city = parts[parts.length - 1];
    }
  }

  const postcode = postcodeMatch ? postcodeMatch[0] : undefined;

  if (city && postcode && city.toUpperCase().includes(postcode.toUpperCase())) {
    city = city.replace(postcode, '').trim();
  }

  return normalizeAddress({ street, city, postcode });
};
