import { z } from 'zod';

export const UpdateMissionSchema = z.object({
  discordId: z.string().min(1),
  guildId: z.string().min(1),
  missionId: z.number().positive(),
  progress: z.number().int().nonnegative(),
});

export type UpdateMissionDto = z.infer<typeof UpdateMissionSchema>;
