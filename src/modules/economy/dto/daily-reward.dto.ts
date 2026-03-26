import { z } from 'zod';

export const DailyRewardSchema = z.object({
  discordId: z.string().min(1),
  guildId: z.string().min(1),
});

export type DailyRewardDto = z.infer<typeof DailyRewardSchema>;

export const DAILY_REWARD_AMOUNT = 100;
export const DAILY_REWARD_COOLDOWN_HOURS = 24;
