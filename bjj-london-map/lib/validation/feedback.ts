import { z } from 'zod';

const optionalNameField = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z
    .string()
    .max(80, { message: 'Name must be 80 characters or fewer.' })
    .optional(),
);

const optionalEmailField = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z
    .string()
    .max(120, { message: 'Email must be 120 characters or fewer.' })
    .email({ message: 'Please provide a valid email address.' })
    .optional(),
);

const messageField = z
  .string()
  .trim()
  .min(10, { message: 'Message must be at least 10 characters.' })
  .max(1000, { message: 'Message must be 1000 characters or fewer.' });

const websiteField = z
  .string()
  .optional()
  .transform((value) => (typeof value === 'string' ? value.trim() : ''));

export const feedbackSchema = z.object({
  name: optionalNameField,
  email: optionalEmailField,
  message: messageField,
  website: websiteField,
});

export type FeedbackSubmission = z.infer<typeof feedbackSchema>;
