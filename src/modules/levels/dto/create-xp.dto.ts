import { z } from 'zod';

export const CreateXPSchema = z.object({
  discordId: z.string().min(1, 'Discord ID obrigatório'),
  guildId: z.string().min(1, 'Guild ID obrigatório'),
  amount: z.number().int().positive('Quantidade deve ser positiva'),
  type: z.enum(['message', 'voice']).default('message'),
});

export type CreateXPDto = z.infer<typeof CreateXPSchema>;
