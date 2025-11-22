/**
 * Normalize athlete/team names for deduplication
 * Converts to lowercase, removes accents, and standardizes spacing
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Normalize technique names for classification
 */
export function normalizeTechniqueName(name: string): string {
  const normalized = normalizeName(name);

  // Map common variations to standard names
  const variations: Record<string, string> = {
    'rnc': 'rear naked choke',
    'rear choke': 'rear naked choke',
    'mata leao': 'rear naked choke',
    'armbar': 'arm bar',
    'armlock': 'arm bar',
    'triangle choke': 'triangle',
    'heel hook': 'heelhook',
    'ankle lock': 'anklelock',
    'toe hold': 'toehold',
    'leg lock': 'leglock',
  };

  return variations[normalized] || normalized;
}

/**
 * Extract submission category from submission name
 */
export function getSubmissionCategory(submissionName: string): string {
  const normalized = normalizeTechniqueName(submissionName);

  if (
    normalized.includes('choke') ||
    normalized.includes('strangle') ||
    normalized.includes('guillotine')
  ) {
    return 'choke';
  }

  if (
    normalized.includes('heel') ||
    normalized.includes('ankle') ||
    normalized.includes('toe') ||
    normalized.includes('knee') ||
    normalized.includes('calf')
  ) {
    return 'leg_lock';
  }

  if (
    normalized.includes('arm') ||
    normalized.includes('shoulder') ||
    normalized.includes('kimura') ||
    normalized.includes('americana')
  ) {
    return 'arm_lock';
  }

  if (normalized.includes('neck') || normalized.includes('spine')) {
    return 'neck_crank';
  }

  return 'other';
}

/**
 * Clean and validate country codes
 */
export function normalizeCountryCode(country: string | null | undefined): string | null {
  if (!country) return null;

  const code = country.toUpperCase().trim();

  // If it's already a 2-letter code, return it
  if (code.length === 2) return code;

  // Map common country names to codes
  const countryMap: Record<string, string> = {
    'UNITED STATES': 'US',
    'USA': 'US',
    'BRAZIL': 'BR',
    'BRASIL': 'BR',
    'JAPAN': 'JP',
    'UNITED KINGDOM': 'GB',
    'UK': 'GB',
    'ENGLAND': 'GB',
    'FRANCE': 'FR',
    'RUSSIA': 'RU',
    'AUSTRALIA': 'AU',
    'CANADA': 'CA',
    'SWEDEN': 'SE',
    'NORWAY': 'NO',
    'POLAND': 'PL',
    'PORTUGAL': 'PT',
    'MEXICO': 'MX',
  };

  return countryMap[code] || null;
}
