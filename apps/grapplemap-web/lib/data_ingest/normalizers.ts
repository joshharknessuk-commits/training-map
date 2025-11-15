import { ContactDetails } from './types';

const phoneDigits = /[^\d+]/g;
const whitespace = /\s+/g;

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const normalizePhone = (value: string) => {
  const cleaned = value.replace(phoneDigits, '');
  if (cleaned.startsWith('44')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  if (cleaned.startsWith('0')) {
    return `+44${cleaned.slice(1)}`;
  }
  return cleaned;
};

export const collapseWhitespace = (value: string) => value.replace(whitespace, ' ').trim();

export const unique = (values: string[]) => {
  return [...new Set(values.filter(Boolean))];
};

export const normalizeContacts = (candidate: ContactDetails): ContactDetails => {
  return {
    emails: unique(candidate.emails.map(normalizeEmail)),
    phones: unique(candidate.phones.map(normalizePhone)),
  };
};

/**
 * TODO: Add UK-specific address + postcode normalization helpers.
 */
