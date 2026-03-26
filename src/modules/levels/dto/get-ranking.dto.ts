import { z } from 'zod';

export const GetRankingSchema = z.object({
  guildId: z.string().min(1),
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

export type GetRankingDto = z.infer<typeof GetRankingSchema>;
