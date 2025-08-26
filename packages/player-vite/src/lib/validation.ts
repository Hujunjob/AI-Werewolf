import { z } from 'zod';

// Define schemas locally to avoid webpack issues with shared packages
export const SpeechResponseSchema = z.object({
  speech: z.string()
});

export const VotingResponseSchema = z.object({
  target: z.number(),
  reason: z.string()
});

export const LastWordsResponseSchema = z.object({
  content: z.string()
});

export const WerewolfNightActionSchema = z.object({
  target: z.number()
});

export const SeerNightActionSchema = z.object({
  target: z.number()
});

export const WitchNightActionSchema = z.object({
  useHeal: z.boolean(),
  healTarget: z.number().optional(),
  usePoison: z.boolean(),
  poisonTarget: z.number().optional()
});