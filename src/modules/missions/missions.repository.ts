import { Injectable } from '@nestjs/common';
import { db } from '@/database/db';
import { missions, userMissions } from '@/database/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class MissionsRepository {
  async createMission(name: string, type: string, requirement: number, reward: number) {
    const [mission] = await db
      .insert(missions)
      .values({
        name,
        type,
        requirement,
        reward,
      })
      .returning();

    return mission;
  }

  async getMissionById(id: number) {
    return db.query.missions.findFirst({
      where: eq(missions.id, id),
    });
  }

  async getAllMissions() {
    return db.query.missions.findMany();
  }

  async startMission(userId: number, missionId: number) {
    const existing = await db.query.userMissions.findFirst({
      where: and(eq(userMissions.userId, userId), eq(userMissions.missionId, missionId)),
    });

    if (existing) return existing;

    const [started] = await db
      .insert(userMissions)
      .values({
        userId,
        missionId,
        progress: 0,
      })
      .returning();

    return started;
  }

  async updateProgress(userId: number, missionId: number, progress: number) {
    const existing = await db.query.userMissions.findFirst({
      where: and(eq(userMissions.userId, userId), eq(userMissions.missionId, missionId)),
    });

    if (!existing) throw new Error('Mission não iniciada');

    const mission = await this.getMissionById(missionId);
    if (!mission) throw new Error('Mission não encontrada');

    const completed = progress >= mission.requirement;

    const [updated] = await db
      .update(userMissions)
      .set({
        progress,
        completed,
        completedAt: completed ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(userMissions.id, existing.id))
      .returning();

    return updated;
  }

  async getUserMissions(userId: number) {
    return db.query.userMissions.findMany({
      where: eq(userMissions.userId, userId),
      with: {
        mission: true,
      },
    });
  }
}
