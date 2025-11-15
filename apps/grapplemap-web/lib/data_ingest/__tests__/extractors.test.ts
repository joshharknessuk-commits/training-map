import assert from 'node:assert/strict';
import test from 'node:test';
import { extractEmails, extractPhones } from '../extractors';
import { normalizeContacts } from '../normalizers';

test('extractEmails finds lowercase + uppercase matches', () => {
  const html = '<a href="mailto:Info@Gym.com">Email</a>';
  const emails = normalizeContacts({ emails: extractEmails(html), phones: [] }).emails;
  assert.deepEqual(emails, ['info@gym.com']);
});

test('extractPhones finds UK numbers and normalizes them', () => {
  const html = '<p>Call us on 0207 123 4567 or +44 7700 900123</p>';
  const phones = normalizeContacts({
    phones: extractPhones(html),
    emails: [],
  }).phones;
  assert.deepEqual(phones, ['+442071234567', '+447700900123']);
});

/**
 * TODO: Add fixtures for JSON-LD + contact blocks once we flesh out the scraper.
 */
