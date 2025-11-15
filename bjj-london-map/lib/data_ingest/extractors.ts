import { load } from 'cheerio';
import { collapseWhitespace } from './normalizers';
import type { KeywordDetection } from './types';

const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const phoneRegex = /(?:(?:\+?44\s?(?:\(0\))?)|0)(?:[\s.-]?\d){9,11}/g;
const giRegex = /\bgi\b/i;
const nogiRegex = /\bno-?\s?gi\b/i;
const nogiSingleWordRegex = /\bnogi\b/i;
const openMatRegex = /\bopen\s+mat\b/i;
const dropInRegex = /\bdrop[-\s]?in\b/i;

export const extractEmails = (html: string): string[] => {
  emailRegex.lastIndex = 0;
  const emails: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = emailRegex.exec(html)) !== null) {
    emails.push(match[0]);
  }
  return emails;
};

export const extractPhones = (html: string): string[] => {
  phoneRegex.lastIndex = 0;
  const phones: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = phoneRegex.exec(html)) !== null) {
    phones.push(match[0]);
  }
  return phones;
};

export const extractKeywords = (html: string): KeywordDetection => {
  const text = collapseWhitespace(load(html).text());
  const lowered = text.toLowerCase();
  const detection: KeywordDetection = {};
  if (giRegex.test(lowered.replace(/nogi/gi, ''))) {
    detection.gi = true;
  }
  if (nogiRegex.test(lowered) || nogiSingleWordRegex.test(lowered)) {
    detection.nogi = true;
  }
  if (openMatRegex.test(lowered)) {
    detection.openMat = true;
  }
  if (dropInRegex.test(lowered)) {
    detection.dropIn = true;
  }
  return detection;
};

/**
 * TODO: Parse structured JSON-LD (<script type="application/ld+json">) for richer data.
 */
