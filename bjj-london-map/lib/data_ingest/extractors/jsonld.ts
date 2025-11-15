import { load } from 'cheerio';
import { normalizeAddress, AddressParts } from './address';
import { normalizeInstagramUrl } from './social';

export interface JsonLdExtraction {
  address?: AddressParts;
  instagram?: string;
  affiliation?: string;
  styleFocus?: string;
  headCoach?: string;
  coaches?: string[];
}

type JsonLdNode = Record<string, unknown>;

const asArray = <T>(value: T | T[] | undefined): T[] => {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};

const valueToString = (value: unknown): string | undefined => {
  if (!value) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'object' && 'name' in value && typeof value.name === 'string') {
    return value.name.trim();
  }
  return undefined;
};

const titleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (segment) =>
        segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase(),
    )
    .join(' ');

const collectNames = (input: unknown): string[] => {
  const names: string[] = [];
  asArray(input).forEach((item) => {
    const name = valueToString(item);
    if (name) {
      names.push(titleCase(name));
    }
  });
  return names;
};

const parseJson = (raw: string): unknown[] => {
  const blocks: unknown[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed && typeof parsed === 'object' && '@graph' in parsed && Array.isArray(parsed['@graph'])) {
      return parsed['@graph'] as unknown[];
    }
    blocks.push(parsed);
  } catch (error) {
    // ignore malformed blocks
  }
  return blocks;
};

const extractAddress = (node: JsonLdNode) => {
  const addressNode = node.address;
  if (addressNode && typeof addressNode === 'object') {
    const street =
      (addressNode as JsonLdNode).streetAddress ??
      (addressNode as JsonLdNode).address ??
      (addressNode as JsonLdNode).address1;
    const city =
      (addressNode as JsonLdNode).addressLocality ??
      (addressNode as JsonLdNode).addressRegion;
    const postcode =
      (addressNode as JsonLdNode).postalCode ??
      (addressNode as JsonLdNode).postCode ??
      (addressNode as JsonLdNode).postcode;

    return normalizeAddress({
      street: valueToString(street),
      city: valueToString(city),
      postcode: valueToString(postcode),
    });
  }
  return undefined;
};

export const extractFromJsonLd = (html: string): JsonLdExtraction => {
  const $ = load(html);
  const scripts = $('script[type="application/ld+json"]');
  const result: JsonLdExtraction = {};
  const coachNames = new Set<string>();

  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') {
      return;
    }
    const data = node as JsonLdNode;
    const type = String(data['@type'] ?? data.type ?? '').toLowerCase();

    if (!result.address) {
      if (type === 'postaladdress') {
        const normalized = normalizeAddress({
          street: valueToString(data.streetAddress),
          city: valueToString(
            data.addressLocality ?? data.addressRegion ?? data.addressCountry,
          ),
          postcode: valueToString(
            data.postalCode ?? data.postCode ?? data.postcode,
          ),
        });
        if (normalized.address || normalized.city || normalized.postcode) {
          result.address = normalized;
        }
      } else {
        const fromNested = extractAddress(data);
        if (fromNested && (fromNested.address || fromNested.city || fromNested.postcode)) {
          result.address = fromNested;
        }
      }
    }

    if (!result.instagram) {
      const sameAs = asArray(data.sameAs).map(valueToString).filter(Boolean) as string[];
      for (const candidate of sameAs) {
        const normalized = normalizeInstagramUrl(candidate);
        if (normalized) {
          result.instagram = normalized;
          break;
        }
      }
    }

    if (!result.affiliation) {
      const affiliationSources = [data.memberOf, data.affiliation, data.brand, data.parentOrganization];
      for (const source of affiliationSources) {
        const name = valueToString(source);
        if (name) {
          result.affiliation = titleCase(name);
          break;
        }
      }
    }

    if (!result.styleFocus) {
      const styleSources = [
        data.knowsAbout,
        data.keywords,
        data.sport,
        data.sportsActivityLocation,
      ];
      for (const source of styleSources) {
        const value = valueToString(source) ?? asArray(source)[0];
        if (typeof value === 'string' && value.trim()) {
          result.styleFocus = value.trim();
          break;
        }
      }
    }

    if (!result.headCoach) {
      const headCandidate =
        valueToString(data.headCoach) ||
        valueToString(data.coach) ||
        valueToString(data.founder);
      if (headCandidate) {
        result.headCoach = titleCase(headCandidate);
      }
    }

    collectNames(data.coach).forEach((name) => coachNames.add(name));
    collectNames(data.employee).forEach((name) => coachNames.add(name));
    collectNames(data.member).forEach((name) => coachNames.add(name));
    collectNames(data.trainer).forEach((name) => coachNames.add(name));
    collectNames(data.staff).forEach((name) => coachNames.add(name));
  };

  scripts.each((_, script) => {
    const raw = $(script).contents().text();
    if (!raw.trim()) {
      return;
    }
    const parsedBlocks = parseJson(raw);
    parsedBlocks.forEach((node) => {
      if (Array.isArray(node)) {
        node.forEach(visit);
      } else {
        visit(node);
      }
    });
  });

  if (result.headCoach) {
    coachNames.delete(result.headCoach);
  }
  if (coachNames.size) {
    result.coaches = Array.from(coachNames);
  }

  return result;
};
