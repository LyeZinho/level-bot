import { z } from 'zod';

export const AddCoinsSchema = z.object({
  discordId: z.string().min(1),
  guildId: z.string().min(1),
  amount: z.number().int().positive('Quantidade deve ser positiva'),
  reason: z.string().default('add'),
});

export type AddCoinsDto = z.infer<typeof AddCoinsSchema>;
