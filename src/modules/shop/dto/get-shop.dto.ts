import { z } from 'zod';

export const GetShopSchema = z.object({
  guildId: z.string().min(1),
});

export type GetShopDto = z.infer<typeof GetShopSchema>;
