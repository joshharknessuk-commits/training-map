import { load } from 'cheerio';
import { collapseWhitespace } from '../normalizers';

const headCoachLabelRegex = /head coach[:\-\s]+(.+)/i;
const namePattern = /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g;

const titleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (segment) =>
        segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase(),
    )
    .join(' ');

const extractNamesFromText = (text: string) => {
  const names: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = namePattern.exec(text)) !== null) {
    const candidate = titleCase(match[0]);
    if (candidate.length >= 5) {
      names.push(candidate);
    }
  }
  return names;
};

export const extractCoaches = (
  html: string,
): { headCoach?: string; coaches?: string[] } => {
  const $ = load(html);
  const names = new Set<string>();
  let headCoach: string | undefined;

  const populatedText = collapseWhitespace($.text());
  const labelMatch = headCoachLabelRegex.exec(populatedText);
  if (labelMatch) {
    const candidate = extractNamesFromText(labelMatch[1])[0];
    if (candidate) {
      headCoach = candidate;
      names.add(candidate);
    }
  }

  const selectors = [
    '.coach-list li',
    '.coaches li',
    '.coach-list__item',
    '.coach-card',
    '.coach',
    '[class*="coach"] li',
  ];

  $(selectors.join(',')).each((_, el) => {
    const text = collapseWhitespace($(el).text());
    extractNamesFromText(text).forEach((name) => names.add(name));
  });

  if (!names.size) {
    $('section, div')
      .filter((_, el) => /coach/i.test($(el).text()))
      .each((_, el) => {
        const text = collapseWhitespace($(el).text());
        extractNamesFromText(text).forEach((name) => names.add(name));
      });
  }

  const coachList = Array.from(names);
  const filteredCoaches = coachList.filter((name) => name !== headCoach);

  return {
    headCoach,
    coaches: filteredCoaches.length ? filteredCoaches : undefined,
  };
};
