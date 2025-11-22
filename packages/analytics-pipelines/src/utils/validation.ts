import { z } from 'zod';

export const athleteSchema = z.object({
  name: z.string().min(1),
  nationality: z.string().optional(),
  team: z.string().optional(),
  birthYear: z.number().optional(),
});

export const matchSchema = z.object({
  tournament: z.string().min(1),
  organization: z.string().min(1),
  year: z.number().min(1900).max(2100),
  weightClass: z.string().min(1),
  athlete1: z.string().min(1),
  athlete2: z.string().min(1),
  winner: z.string().min(1),
  result: z.enum(['submission', 'points', 'decision', 'advantage', 'dq', 'draw']),
  submissionType: z.string().optional(),
  athlete1Score: z.number().default(0),
  athlete2Score: z.number().default(0),
  durationSeconds: z.number().optional(),
  round: z.string().optional(),
});

export type AthleteData = z.infer<typeof athleteSchema>;
export type MatchData = z.infer<typeof matchSchema>;
