import { Injectable, Inject } from '@nestjs/common';
import { and, eq, desc } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { DRIZZLE } from '../database/drizzle.provider';

@Injectable()
export class BadgesService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async awardBadge(userId: string, guildId: string, badgeId: number): Promise<void> {
    const existing = await this.db
      .select()
      .from(schema.userBadges)
      .where(
        and(
          eq(schema.userBadges.userId, userId),
          eq(schema.userBadges.guildId, guildId),
          eq(schema.userBadges.badgeId, badgeId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      await this.db.insert(schema.userBadges).values({
        userId,
        guildId,
        badgeId,
        earnedAt: new Date(),
      });
    }
  }

  async getUserBadges(userId: string, guildId: string): Promise<any[]> {
    return this.db
      .select({
        id: schema.userBadges.id,
        userId: schema.userBadges.userId,
        guildId: schema.userBadges.guildId,
        badgeId: schema.userBadges.badgeId,
        earnedAt: schema.userBadges.earnedAt,
        expiresAt: schema.userBadges.expiresAt,
        name: schema.badges.name,
        imagePath: schema.badges.imagePath,
        badgeType: schema.badges.badgeType,
        tier: schema.badges.tier,
      })
      .from(schema.userBadges)
      .innerJoin(schema.badges, eq(schema.userBadges.badgeId, schema.badges.badgeId))
      .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.guildId, guildId)))
      .orderBy(desc(schema.userBadges.earnedAt));
  }

  async checkRankBadge(userId: string, guildId: string, rank: number): Promise<boolean> {
    let badgeName = null;

    if (rank === 1) badgeName = 'Top 1';
    else if (rank === 2) badgeName = 'Top 2';
    else if (rank === 3) badgeName = 'Top 3';
    else if (rank <= 10) badgeName = 'Top 10';

    if (!badgeName) return false;

    const badge = await this.db.select().from(schema.badges).where(eq(schema.badges.name, badgeName)).limit(1);

    if (badge.length === 0) return false;

    await this.awardBadge(userId, guildId, badge[0].badgeId);
    return true;
  }

  async getAvailableBadges(): Promise<typeof schema.badges.$inferSelect[]> {
    return this.db.select().from(schema.badges).orderBy(schema.badges.tier);
  }

  async removeBadge(userId: string, guildId: string, badgeId: number): Promise<void> {
    await this.db
      .delete(schema.userBadges)
      .where(
        and(
          eq(schema.userBadges.userId, userId),
          eq(schema.userBadges.guildId, guildId),
          eq(schema.userBadges.badgeId, badgeId),
        ),
      );
  }
}
