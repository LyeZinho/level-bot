import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'discord.js';
import { and, eq, desc, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { DRIZZLE } from '../database/drizzle.provider';
import { CacheService } from '../cache/cache.service';
import {
  XP_PER_MESSAGE_MIN,
  XP_PER_MESSAGE_MAX,
  COINS_PER_100_XP,
  MAX_COINS_PER_MESSAGE,
  XP_PER_VOICE_MINUTE,
} from './xp.constants';

@Injectable()
export class LevelingService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    private cacheService: CacheService,
    private configService: ConfigService,
  ) {}

  calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  getXPForLevel(level: number): number {
    return Math.pow(level - 1, 2) * 100;
  }

  getXPProgress(xp: number): { current: number; needed: number; percentage: number } {
    const currentLevel = this.calculateLevel(xp);
    const currentLevelXp = this.getXPForLevel(currentLevel);
    const nextLevelXp = this.getXPForLevel(currentLevel + 1);
    const current = xp - currentLevelXp;
    const needed = nextLevelXp - currentLevelXp;
    const percentage = Math.round((current / needed) * 100);
    return { current, needed, percentage };
  }

  async getTotalMultiplier(userId: string, guildId: string): Promise<{ multiplier: number; hasVip: boolean; hasBoost: boolean }> {
    let multiplier = 1;
    let hasVip = false;
    let hasBoost = false;

    const cacheKey = `multiplier:${userId}:${guildId}`;
    const cached = await this.cacheService.get<{ multiplier: number; hasVip: boolean; hasBoost: boolean }>(cacheKey);
    if (cached) return cached;

    const vip = await this.db.select().from(schema.userVips).where(and(eq(schema.userVips.userId, userId), eq(schema.userVips.guildId, guildId))).limit(1);
    if (vip.length > 0 && vip[0].active) {
      multiplier *= vip[0].multiplier;
      hasVip = true;
    }

    const boosts = await this.db.select().from(schema.userBoosts).where(and(eq(schema.userBoosts.userId, userId), eq(schema.userBoosts.guildId, guildId)));
    if (boosts.length > 0) {
      const now = new Date();
      const activeBoost = boosts.find((b) => new Date(b.expiresAt) > now);
      if (activeBoost) {
        multiplier *= parseFloat(activeBoost.multiplier.toString());
        hasBoost = true;
      }
    }

    await this.cacheService.set(cacheKey, { multiplier, hasVip, hasBoost }, 600);
    return { multiplier, hasVip, hasBoost };
  }

  async addMessageXP(userId: string, username: string, guildId: string, xpGain: number) {
    let user = await this.db.select().from(schema.users).where(and(eq(schema.users.userId, userId), eq(schema.users.guildId, guildId))).limit(1);

    if (user.length === 0) {
      await this.db.insert(schema.users).values({
        userId,
        guildId,
        xp: '0',
        level: 0,
        messages: 0,
        voiceTime: 0,
        coins: '0',
      });
      user = await this.db.select().from(schema.users).where(and(eq(schema.users.userId, userId), eq(schema.users.guildId, guildId))).limit(1);
    }

    const { multiplier, hasVip, hasBoost } = await this.getTotalMultiplier(userId, guildId);
    const finalXpGain = Math.floor(xpGain * multiplier);

    const newXP = parseInt(user[0].xp) + finalXpGain;
    const oldLevel = user[0].level;
    const newLevel = this.calculateLevel(newXP);

    const oldCoinsFromXp = Math.floor(parseInt(user[0].xp) / 100);
    const newCoinsFromXp = Math.floor(newXP / 100);
    let coinsGained = Math.floor((newCoinsFromXp - oldCoinsFromXp) * multiplier);
    coinsGained = Math.min(coinsGained, MAX_COINS_PER_MESSAGE);

    await this.db
      .update(schema.users)
      .set({
        xp: newXP.toString(),
        level: newLevel,
        messages: (user[0].messages || 0) + 1,
        coins: (parseInt(user[0].coins) + coinsGained).toString(),
      })
      .where(and(eq(schema.users.userId, userId), eq(schema.users.guildId, guildId)));

    await this.cacheService.del(`multiplier:${userId}:${guildId}`);

    return {
      levelUp: newLevel > oldLevel,
      oldLevel,
      newLevel,
      xp: newXP,
      coinsGained,
      xpGained: finalXpGain,
      multiplier,
      hasVip,
      hasBoost,
    };
  }

  async addVoiceTime(userId: string, username: string, guildId: string, seconds: number) {
    let user = await this.db.select().from(schema.users).where(and(eq(schema.users.userId, userId), eq(schema.users.guildId, guildId))).limit(1);

    if (user.length === 0) {
      await this.db.insert(schema.users).values({
        userId,
        guildId,
        xp: '0',
        level: 0,
        messages: 0,
        voiceTime: 0,
        coins: '0',
      });
      user = await this.db.select().from(schema.users).where(and(eq(schema.users.userId, userId), eq(schema.users.guildId, guildId))).limit(1);
    }

    const baseXpGain = Math.floor(seconds / 60) * XP_PER_VOICE_MINUTE;
    const { multiplier, hasVip, hasBoost } = await this.getTotalMultiplier(userId, guildId);
    const finalXpGain = Math.floor(baseXpGain * multiplier);

    const newXP = parseInt(user[0].xp) + finalXpGain;
    const oldLevel = user[0].level;
    const newLevel = this.calculateLevel(newXP);

    const oldCoinsFromXp = Math.floor(parseInt(user[0].xp) / 100);
    const newCoinsFromXp = Math.floor(newXP / 100);
    const coinsGained = Math.floor((newCoinsFromXp - oldCoinsFromXp) * multiplier);

    await this.db
      .update(schema.users)
      .set({
        voiceTime: (user[0].voiceTime || 0) + seconds,
        xp: newXP.toString(),
        level: newLevel,
        coins: (parseInt(user[0].coins) + coinsGained).toString(),
      })
      .where(and(eq(schema.users.userId, userId), eq(schema.users.guildId, guildId)));

    await this.cacheService.del(`multiplier:${userId}:${guildId}`);

    return {
      levelUp: newLevel > oldLevel,
      oldLevel,
      newLevel,
      coinsGained,
      xpGained: finalXpGain,
      multiplier,
      hasVip,
      hasBoost,
    };
  }

  async getRanking(guildId: string, limit = 10) {
    return this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.guildId, guildId))
      .orderBy(desc(schema.users.xp))
      .limit(limit);
  }

  async getUserRank(userId: string, guildId: string): Promise<number> {
    const result = await this.db
      .select({ rank: sql<number>`COUNT(*) + 1` })
      .from(schema.users)
      .where(and(eq(schema.users.guildId, guildId), sql`xp > (SELECT xp FROM users WHERE user_id = ${userId} AND guild_id = ${guildId})`));
    return result[0]?.rank || 1;
  }

  async getLevelInfo(userId: string, guildId: string) {
    const user = await this.db.select().from(schema.users).where(and(eq(schema.users.userId, userId), eq(schema.users.guildId, guildId))).limit(1);

    if (user.length === 0) {
      return null;
    }

    const userRecord = user[0];
    const rank = await this.getUserRank(userId, guildId);
    const progress = this.getXPProgress(parseInt(userRecord.xp));

    return {
      user: userRecord,
      rank,
      progress,
    };
  }

  async recalculateAllLevels() {
    const allUsers = await this.db.select().from(schema.users);

    for (const user of allUsers) {
      const newLevel = this.calculateLevel(parseInt(user.xp));
      if (newLevel !== user.level) {
        await this.db
          .update(schema.users)
          .set({ level: newLevel })
          .where(and(eq(schema.users.userId, user.userId), eq(schema.users.guildId, user.guildId)));
      }
    }
  }

  async forceSetLevel(userId: string, guildId: string, newLevel: number) {
    const xp = this.getXPForLevel(newLevel);
    await this.db
      .update(schema.users)
      .set({ xp: xp.toString(), level: newLevel })
      .where(and(eq(schema.users.userId, userId), eq(schema.users.guildId, guildId)));

    await this.cacheService.del(`multiplier:${userId}:${guildId}`);
  }

  async sendLevelUpNotification(client: Client, guildId: string, userId: string, newLevel: number) {
    const channelId = this.configService.get('LEVEL_UP_NOTIFICATION_CHANNEL_ID');
    if (!channelId) return;

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

      const embed = {
        title: `🎉 Level Up!`,
        description: `<@${userId}> reached level **${newLevel}**!`,
        color: 0x00ff00,
        timestamp: new Date().toISOString(),
      };

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending level-up notification:', error);
    }
  }
}
