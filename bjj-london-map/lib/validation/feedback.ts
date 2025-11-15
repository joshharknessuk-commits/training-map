import { z } from 'zod';

const optionalNameField = z
  .union([z.string().trim().max(120, { message: 'Name must be 120 characters or fewer.' }), z.literal(''), z.undefined()])
  .transform((value) => {
    if (!value) {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  });

const optionalEmailField = z
  .union([
    z
      .string()
      .trim()
      .email({ message: 'Please provide a valid email address.' })
      .max(180, { message: 'Email must be 180 characters or fewer.' }),
    z.literal(''),
    z.undefined(),
  ])
  .transform((value) => {
    if (!value) {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  });

const honeypotField = z
  .union([z.string(), z.undefined()])
  .transform((value) => (value ?? '').trim());

export const feedbackSchema = z.object({
  name: optionalNameField,
  email: optionalEmailField,
  message: z
    .string()
    .trim()
    .min(10, { message: 'Message must be at least 10 characters.' })
    .max(1000, { message: 'Message must be 1000 characters or fewer.' }),
  website: honeypotField.default(''),
});

export type FeedbackSubmission = z.infer<typeof feedbackSchema>;
