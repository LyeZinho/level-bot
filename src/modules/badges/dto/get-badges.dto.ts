import { z } from 'zod';

export const GetBadgesSchema = z.object({
  discordId: z.string().min(1),
  guildId: z.string().min(1),
});

export type GetBadgesDto = z.infer<typeof GetBadgesSchema>;
