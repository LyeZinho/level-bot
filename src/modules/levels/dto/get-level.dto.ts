import { z } from 'zod';

export const GetLevelSchema = z.object({
  discordId: z.string().min(1),
  guildId: z.string().min(1),
});

export type GetLevelDto = z.infer<typeof GetLevelSchema>;
