import { z } from 'zod';

export const BuyItemSchema = z.object({
  discordId: z.string().min(1),
  guildId: z.string().min(1),
  itemId: z.number().positive(),
  quantity: z.number().int().positive().default(1),
});

export type BuyItemDto = z.infer<typeof BuyItemSchema>;
