import { z } from 'zod';

export const GetMissionsSchema = z.object({
  discordId: z.string().min(1),
  guildId: z.string().min(1),
});

export type GetMissionsDto = z.infer<typeof GetMissionsSchema>;
