import { Injectable } from '@nestjs/common';
import { db } from '@/database/db';
import { users, userLevels } from '@/database/schema';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class LevelsRepository {
  async getOrCreateUser(discordId: string, guildId: string, username: string) {
    const existingUser = await db.query.users.findFirst({
      where: and(eq(users.discordId, discordId), eq(users.guildId, guildId)),
    });

    if (existingUser) return existingUser;

    const [newUser] = await db
      .insert(users)
      .values({
        discordId,
        guildId,
        username,
      })
      .returning();

    return newUser;
  }

  async getOrCreateLevel(userId: number, guildId: string) {
    const existingLevel = await db.query.userLevels.findFirst({
      where: and(eq(userLevels.userId, userId), eq(userLevels.guildId, guildId)),
    });

    if (existingLevel) return existingLevel;

    const [newLevel] = await db
      .insert(userLevels)
      .values({
        userId,
        guildId,
        xp: 0,
        level: 1,
        totalXp: 0,
      })
      .returning();

    return newLevel;
  }

  async addXP(userId: number, guildId: string, amount: number) {
    const levels = await db.query.userLevels.findFirst({
      where: and(eq(userLevels.userId, userId), eq(userLevels.guildId, guildId)),
    });

    if (!levels) throw new Error('Nível não encontrado');

    const newXP = levels.xp + amount;
    const newTotalXP = levels.totalXp + amount;
    const newLevel = Math.floor(newTotalXP / 1000) + 1;

    const [updated] = await db
      .update(userLevels)
      .set({
        xp: newXP % 1000,
        level: newLevel,
        totalXp: newTotalXP,
        updatedAt: new Date(),
      })
      .where(eq(userLevels.id, levels.id))
      .returning();

    return updated;
  }

  async getUserLevel(userId: number, guildId: string) {
    return db.query.userLevels.findFirst({
      where: and(eq(userLevels.userId, userId), eq(userLevels.guildId, guildId)),
    });
  }

  async getRanking(guildId: string, limit: number, offset: number) {
    return db.query.userLevels.findMany({
      where: eq(userLevels.guildId, guildId),
      limit,
      offset,
      orderBy: [desc(userLevels.level), desc(userLevels.totalXp)],
      with: {
        user: true,
      },
    });
  }

  async incrementMessageCount(userId: number, guildId: string) {
    const levels = await db.query.userLevels.findFirst({
      where: and(eq(userLevels.userId, userId), eq(userLevels.guildId, guildId)),
    });

    if (!levels) throw new Error('Nível não encontrado');

    const [updated] = await db
      .update(userLevels)
      .set({
        messageCount: levels.messageCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(userLevels.id, levels.id))
      .returning();

    return updated;
  }

  async addVoiceSeconds(userId: number, guildId: string, seconds: number) {
    const levels = await db.query.userLevels.findFirst({
      where: and(eq(userLevels.userId, userId), eq(userLevels.guildId, guildId)),
    });

    if (!levels) throw new Error('Nível não encontrado');

    const [updated] = await db
      .update(userLevels)
      .set({
        voiceSeconds: levels.voiceSeconds + seconds,
        updatedAt: new Date(),
      })
      .where(eq(userLevels.id, levels.id))
      .returning();

    return updated;
  }
}
