import { z } from 'zod';

export const UseItemSchema = z.object({
  discordId: z.string().min(1),
  guildId: z.string().min(1),
  itemId: z.number().positive(),
});

export type UseItemDto = z.infer<typeof UseItemSchema>;
