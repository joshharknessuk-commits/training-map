import { z } from 'zod';

const optionalUrlField = z
  .string()
  .trim()
  .url({ message: 'Please provide a valid URL.' })
  .max(500, { message: 'Proof URL must be 500 characters or fewer.' })
  .or(z.literal(''))
  .transform((value) => (value === '' ? undefined : value))
  .optional();

const optionalMessageField = z
  .string()
  .trim()
  .max(1000, { message: 'Message must be 1000 characters or fewer.' })
  .or(z.literal(''))
  .transform((value) => (value === '' ? undefined : value))
  .optional();

export const claimSchema = z.object({
  gymId: z.string().uuid({ message: 'Gym ID must be a valid UUID.' }),
  name: z
    .string()
    .trim()
    .min(1, { message: 'Name is required.' })
    .max(120, { message: 'Name must be 120 characters or fewer.' }),
  email: z.string().trim().email({ message: 'Please provide a valid email address.' }),
  proof: optionalUrlField,
  message: optionalMessageField,
});

export type ClaimSubmission = z.infer<typeof claimSchema>;
