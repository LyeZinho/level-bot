import { z } from 'zod';

export const GetInventorySchema = z.object({
  discordId: z.string().min(1),
  guildId: z.string().min(1),
});

export type GetInventoryDto = z.infer<typeof GetInventorySchema>;
