import { Injectable, Inject } from '@nestjs/common';
import { and, eq, desc, gte } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { DRIZZLE } from '../database/drizzle.provider';
import { BadgesService } from './badges.service';

@Injectable()
export class MissionsService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    private badgesService: BadgesService,
  ) {}

  async trackProgress(userId: string, guildId: string, missionId: number, progressAmount: number): Promise<void> {
    const mission = await this.db.select().from(schema.missions).where(eq(schema.missions.missionId, missionId)).limit(1);

    if (mission.length === 0) return;

    const existing = await this.db
      .select()
      .from(schema.userMissions)
      .where(
        and(
          eq(schema.userMissions.userId, userId),
          eq(schema.userMissions.guildId, guildId),
          eq(schema.userMissions.missionId, missionId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      await this.db.insert(schema.userMissions).values({
        userId,
        guildId,
        missionId,
        currentValue: progressAmount,
        completed: false,
        startedAt: new Date(),
      });
    } else {
      const currentVal = typeof existing[0].currentValue === 'string' ? parseInt(existing[0].currentValue) : existing[0].currentValue;
      const newValue = Math.min(
        currentVal + progressAmount,
        mission[0].targetValue,
      );

      const completed = newValue >= mission[0].targetValue;

      await this.db
        .update(schema.userMissions)
        .set({
          currentValue: newValue,
          completed,
          completedAt: completed ? new Date() : existing[0].completedAt,
        })
        .where(
          and(
            eq(schema.userMissions.userId, userId),
            eq(schema.userMissions.guildId, guildId),
            eq(schema.userMissions.missionId, missionId),
          ),
        );

      if (completed && !existing[0].completed) {
        if (mission[0].rewardBadgeId) {
          await this.badgesService.awardBadge(userId, guildId, mission[0].rewardBadgeId);
        }
      }
    }
  }

  async completeMission(userId: string, guildId: string, missionId: number): Promise<boolean> {
    const mission = await this.db.select().from(schema.missions).where(eq(schema.missions.missionId, missionId)).limit(1);

    if (mission.length === 0) return false;

    const existing = await this.db
      .select()
      .from(schema.userMissions)
      .where(
        and(
          eq(schema.userMissions.userId, userId),
          eq(schema.userMissions.guildId, guildId),
          eq(schema.userMissions.missionId, missionId),
        ),
      )
      .limit(1);

    if (existing.length === 0 || existing[0].completed) return false;

    await this.db
      .update(schema.userMissions)
      .set({
        completed: true,
        completedAt: new Date(),
        currentValue: mission[0].targetValue,
      })
      .where(
        and(
          eq(schema.userMissions.userId, userId),
          eq(schema.userMissions.guildId, guildId),
          eq(schema.userMissions.missionId, missionId),
        ),
      );

    if (mission[0].rewardBadgeId) {
      await this.badgesService.awardBadge(userId, guildId, mission[0].rewardBadgeId);
    }

    return true;
  }

  async getUserMissions(userId: string, guildId: string): Promise<any[]> {
    return this.db
      .select({
        id: schema.userMissions.id,
        userId: schema.userMissions.userId,
        guildId: schema.userMissions.guildId,
        missionId: schema.userMissions.missionId,
        currentValue: schema.userMissions.currentValue,
        completed: schema.userMissions.completed,
        completedAt: schema.userMissions.completedAt,
        startedAt: schema.userMissions.startedAt,
        missionType: schema.missions.missionType,
        targetValue: schema.missions.targetValue,
        rewardCoins: schema.missions.rewardCoins,
        description: schema.missions.description,
      })
      .from(schema.userMissions)
      .innerJoin(schema.missions, eq(schema.userMissions.missionId, schema.missions.missionId))
      .where(and(eq(schema.userMissions.userId, userId), eq(schema.userMissions.guildId, guildId)))
      .orderBy(desc(schema.userMissions.completedAt));
  }

  async getActiveMissions(): Promise<typeof schema.missions.$inferSelect[]> {
    return this.db.select().from(schema.missions).orderBy(schema.missions.missionType);
  }
}
