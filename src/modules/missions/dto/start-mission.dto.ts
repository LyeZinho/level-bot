import { z } from 'zod';

export const StartMissionSchema = z.object({
  discordId: z.string().min(1),
  guildId: z.string().min(1),
  missionId: z.number().positive(),
});

export type StartMissionDto = z.infer<typeof StartMissionSchema>;
