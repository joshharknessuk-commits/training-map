import { load } from 'cheerio';
import { collapseWhitespace } from '../normalizers';

const AFFILIATION_KEYWORDS = [
  { pattern: /gracie\s+barra/gi, label: 'Gracie Barra' },
  { pattern: /roger\s+gracie/gi, label: 'Roger Gracie' },
  { pattern: /checkmat/gi, label: 'Checkmat' },
  { pattern: /atos/gi, label: 'Atos' },
  { pattern: /alliance/gi, label: 'Alliance' },
  { pattern: /carpe\s+diem/gi, label: 'Carpe Diem' },
  { pattern: /10th\s*planet/gi, label: '10th Planet' },
  { pattern: /\brga\b/gi, label: 'RGA' },
  { pattern: /\bgb\b/gi, label: 'Gracie Barra' },
];

const STYLE_KEYWORDS = [
  { pattern: /\bno-?\s?gi\b/gi, label: 'no-gi' },
  { pattern: /\bgi\s+only\b/gi, label: 'gi' },
  { pattern: /\bsubmission\s+wrestling\b/gi, label: 'submission wrestling' },
  { pattern: /\bself[-\s]?defence\b/gi, label: 'self-defence' },
];

export const detectAffiliation = (
  html: string,
): { affiliation?: string; styleFocus?: string } => {
  const text = collapseWhitespace(load(html).text());
  const output: { affiliation?: string; styleFocus?: string } = {};

  for (const entry of AFFILIATION_KEYWORDS) {
    if (entry.pattern.test(text)) {
      output.affiliation = entry.label;
      break;
    }
  }

  for (const entry of STYLE_KEYWORDS) {
    if (entry.pattern.test(text)) {
      output.styleFocus = entry.label;
      break;
    }
  }

  return output;
};
