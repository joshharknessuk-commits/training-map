export interface GymSeed {
  id: string;
  name: string;
  website?: string | null;
  borough?: string | null;
}

export interface ContactDetails {
  emails: string[];
  phones: string[];
}

export interface GymEnrichmentResult {
  gym: GymSeed;
  contacts: ContactDetails;
  keywords: KeywordDetection;
  fetchedAt: string;
  sourceUrl?: string;
  errors?: string[];
  address?: string;
  postcode?: string;
  city?: string;
  headCoach?: string;
  coaches?: string[];
  affiliation?: string;
  lineage?: string;
  styleFocus?: string;
  instagram?: string;
}

export interface ScrapeRequest {
  gym: GymSeed;
  dryRun?: boolean;
}

export interface ScrapeResponse {
  data: GymEnrichmentResult;
  rawHtmlLength?: number;
  failed?: boolean;
  failureReason?: string;
}

export interface PageFetchResult {
  url: string;
  html?: string;
  status?: number;
  error?: string;
  strategy?: 'http' | 'browser';
  errors?: string[];
}

export interface KeywordDetection {
  gi?: boolean;
  nogi?: boolean;
  openMat?: boolean;
  dropIn?: boolean;
}

/**
 * TODO: Extend this shape with fields for affiliations, head coaches, schedule summaries, etc.
 */
export interface EnrichmentEnvelope {
  contacts: ContactDetails;
  keywords: KeywordDetection;
}
