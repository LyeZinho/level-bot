import { z } from 'zod';

export const AwardBadgeSchema = z.object({
  discordId: z.string().min(1),
  guildId: z.string().min(1),
  badgeName: z.string().min(1),
});

export type AwardBadgeDto = z.infer<typeof AwardBadgeSchema>;
