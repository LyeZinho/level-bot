import { Injectable } from '@nestjs/common';
import { MissionsRepository } from './missions.repository';
import { RedisService } from '@/redis/redis.service';
import { StartMissionDto } from './dto/start-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { GetMissionsDto } from './dto/get-missions.dto';
import { db } from '@/database/db';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class MissionsService {
  constructor(
    private missionsRepository: MissionsRepository,
    private redisService: RedisService,
  ) {}

  async startMission(dto: StartMissionDto) {
    const userData = await db.query.users.findFirst({
      where: eq(users.discordId, dto.discordId),
    });

    if (!userData) throw new Error('Usuário não encontrado');

    const result = await this.missionsRepository.startMission(userData.id, dto.missionId);
    await this.redisService.invalidatePattern(`missions:${userData.id}:*`);

    return result;
  }

  async updateProgress(dto: UpdateMissionDto) {
    const userData = await db.query.users.findFirst({
      where: eq(users.discordId, dto.discordId),
    });

    if (!userData) throw new Error('Usuário não encontrado');

    const result = await this.missionsRepository.updateProgress(userData.id, dto.missionId, dto.progress);
    await this.redisService.invalidatePattern(`missions:${userData.id}:*`);

    return result;
  }

  async getUserMissions(dto: GetMissionsDto) {
    const cacheKey = `missions:${dto.discordId}:${dto.guildId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const userData = await db.query.users.findFirst({
      where: eq(users.discordId, dto.discordId),
    });

    if (!userData) throw new Error('Usuário não encontrado');

    const userMissions = await this.missionsRepository.getUserMissions(userData.id);
    await this.redisService.set(cacheKey, userMissions, 600);

    return userMissions;
  }

  async getAllMissions() {
    const cached = await this.redisService.get('missions:all');
    if (cached) return cached;

    const allMissions = await this.missionsRepository.getAllMissions();
    await this.redisService.set('missions:all', allMissions, 3600);

    return allMissions;
  }
}
