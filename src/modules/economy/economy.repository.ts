import { Injectable } from '@nestjs/common';
import { db } from '@/database/db';
import { users, userCoins } from '@/database/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class EconomyRepository {
  async getOrCreateCoins(userId: number, guildId: string) {
    const existingCoins = await db.query.userCoins.findFirst({
      where: and(eq(userCoins.userId, userId), eq(userCoins.guildId, guildId)),
    });

    if (existingCoins) return existingCoins;

    const [newCoins] = await db
      .insert(userCoins)
      .values({
        userId,
        guildId,
        balance: 0,
      })
      .returning();

    return newCoins;
  }

  async addCoins(userId: number, guildId: string, amount: number) {
    const coins = await this.getOrCreateCoins(userId, guildId);

    const [updated] = await db
      .update(userCoins)
      .set({
        balance: coins.balance + amount,
        totalEarned: coins.totalEarned + amount,
        updatedAt: new Date(),
      })
      .where(eq(userCoins.id, coins.id))
      .returning();

    return updated;
  }

  async removeCoins(userId: number, guildId: string, amount: number) {
    const coins = await this.getOrCreateCoins(userId, guildId);

    if (coins.balance < amount) throw new Error('Saldo insuficiente');

    const [updated] = await db
      .update(userCoins)
      .set({
        balance: coins.balance - amount,
        totalSpent: coins.totalSpent + amount,
        updatedAt: new Date(),
      })
      .where(eq(userCoins.id, coins.id))
      .returning();

    return updated;
  }

  async getUserCoins(userId: number, guildId: string) {
    return db.query.userCoins.findFirst({
      where: and(eq(userCoins.userId, userId), eq(userCoins.guildId, guildId)),
    });
  }

  async claimDaily(userId: number, guildId: string, rewardAmount: number) {
    const coins = await this.getOrCreateCoins(userId, guildId);

    const [updated] = await db
      .update(userCoins)
      .set({
        balance: coins.balance + rewardAmount,
        totalEarned: coins.totalEarned + rewardAmount,
        lastDailyAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userCoins.id, coins.id))
      .returning();

    return updated;
  }
}
