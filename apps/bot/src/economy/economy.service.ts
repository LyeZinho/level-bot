import { Injectable, Inject } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { DRIZZLE } from '../database/drizzle.provider';

@Injectable()
export class EconomyService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async addCoins(userId: string, guildId: string, amount: number): Promise<void> {
    await this.db
      .update(schema.users)
      .set({
        coins: sql`coins + ${amount}`,
      })
      .where(and(eq(schema.users.userId, userId), eq(schema.users.guildId, guildId)));
  }

  async removeCoins(userId: string, guildId: string, amount: number): Promise<number> {
    const result = await this.db
      .update(schema.users)
      .set({
        coins: sql`GREATEST(0, coins - ${amount})`,
      })
      .where(and(eq(schema.users.userId, userId), eq(schema.users.guildId, guildId)))
      .returning();

    return parseInt(result[0]?.coins || '0');
  }

  async transferCoins(fromUserId: string, toUserId: string, guildId: string, amount: number): Promise<{ success: boolean; reason?: string }> {
    try {
      const sender = await this.db
        .select()
        .from(schema.users)
        .where(and(eq(schema.users.userId, fromUserId), eq(schema.users.guildId, guildId)))
        .limit(1);

      if (sender.length === 0 || parseInt(sender[0].coins) < amount) {
        return { success: false, reason: 'insufficient_funds' };
      }

      await this.removeCoins(fromUserId, guildId, amount);
      await this.addCoins(toUserId, guildId, amount);

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

   async getBalance(userId: string, guildId: string): Promise<{ coins: number } | null> {
     const user = await this.db
       .select()
       .from(schema.users)
       .where(and(eq(schema.users.userId, userId), eq(schema.users.guildId, guildId)))
       .limit(1);

     if (user.length === 0) {
       return null;
     }

     return { coins: parseInt(user[0].coins) };
   }

   async claimDaily(userId: string, guildId: string): Promise<{ success: boolean; reason?: string; amount?: number; timeLeft?: number }> {
     const user = await this.db
       .select()
       .from(schema.users)
       .where(and(eq(schema.users.userId, userId), eq(schema.users.guildId, guildId)))
       .limit(1);

     if (user.length === 0) {
       return { success: false, reason: 'user_not_found' };
     }

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const lastClaim = user[0].lastDailyClaimAt?.getTime() || 0;

    if (now - lastClaim < oneDayMs) {
      const timeLeft = oneDayMs - (now - lastClaim);
      return { success: false, reason: 'already_claimed', timeLeft };
    }

    const dailyAmount = Math.floor(Math.random() * 3) + 3;

    await this.db
      .update(schema.users)
      .set({
        coins: (parseInt(user[0].coins) + dailyAmount).toString(),
        lastDailyClaimAt: new Date(),
      })
      .where(and(eq(schema.users.userId, userId), eq(schema.users.guildId, guildId)));

    return { success: true, amount: dailyAmount };
  }
}
