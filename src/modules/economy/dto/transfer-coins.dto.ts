import { z } from 'zod';

export const TransferCoinsSchema = z.object({
  fromDiscordId: z.string().min(1),
  toDiscordId: z.string().min(1),
  guildId: z.string().min(1),
  amount: z.number().int().positive('Quantidade deve ser positiva'),
});

export type TransferCoinsDto = z.infer<typeof TransferCoinsSchema>;
