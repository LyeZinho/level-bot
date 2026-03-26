import { Injectable } from '@nestjs/common';
import { db } from '@/database/db';
import { badges, userBadges, users } from '@/database/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class BadgesRepository {
  async getOrCreateBadge(name: string, emoji: string, rarity: string = 'common') {
    const existing = await db.query.badges.findFirst({
      where: eq(badges.name, name),
    });

    if (existing) return existing;

    const [newBadge] = await db
      .insert(badges)
      .values({
        name,
        emoji,
        rarity,
      })
      .returning();

    return newBadge;
  }

  async awardBadge(userId: number, badgeId: number) {
    const existing = await db.query.userBadges.findFirst({
      where: and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)),
    });

    if (existing) return existing;

    const [awarded] = await db
      .insert(userBadges)
      .values({
        userId,
        badgeId,
      })
      .returning();

    return awarded;
  }

  async getUserBadges(userId: number) {
    return db.query.userBadges.findMany({
      where: eq(userBadges.userId, userId),
      with: {
        badge: true,
      },
    });
  }

  async getAllBadges() {
    return db.query.badges.findMany();
  }

  async hasBadge(userId: number, badgeId: number): Promise<boolean> {
    const badge = await db.query.userBadges.findFirst({
      where: and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)),
    });
    return !!badge;
  }
}
