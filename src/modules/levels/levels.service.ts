import { Injectable } from '@nestjs/common';
import { LevelsRepository } from './levels.repository';
import { RedisService } from '@/redis/redis.service';
import { CreateXPDto } from './dto/create-xp.dto';

@Injectable()
export class LevelsService {
  private readonly XP_PER_LEVEL = 1000;

  constructor(
    private levelsRepository: LevelsRepository,
    private redisService: RedisService,
  ) {}

  async addXP(dto: CreateXPDto) {
    const user = await this.levelsRepository.getOrCreateUser(
      dto.discordId,
      dto.guildId,
      'Unknown',
    );

    await this.levelsRepository.getOrCreateLevel(user.id, dto.guildId);
    const updated = await this.levelsRepository.addXP(user.id, dto.guildId, dto.amount);

    await this.redisService.invalidatePattern(`levels:user:${user.id}:*`);
    await this.redisService.invalidatePattern(`ranking:${dto.guildId}`);

    return updated;
  }

  async getUserLevel(discordId: string, guildId: string) {
    const cacheKey = `levels:user:${discordId}:${guildId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const user = await this.levelsRepository.getOrCreateUser(
      discordId,
      guildId,
      'Unknown',
    );

    const level = await this.levelsRepository.getOrCreateLevel(user.id, guildId);
    const userInfo = await this.levelsRepository.getUserLevel(user.id, guildId);

    const result = { user, level: userInfo };
    await this.redisService.set(cacheKey, result, 300);

    return result;
  }

  async getRanking(guildId: string, limit: number = 10, offset: number = 0) {
    const cacheKey = `ranking:${guildId}:${limit}:${offset}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const ranking = await this.levelsRepository.getRanking(guildId, limit, offset);
    await this.redisService.set(cacheKey, ranking, 600);

    return ranking;
  }

  async incrementMessageCount(discordId: string, guildId: string) {
    const user = await this.levelsRepository.getOrCreateUser(
      discordId,
      guildId,
      'Unknown',
    );

    return this.levelsRepository.incrementMessageCount(user.id, guildId);
  }

  async addVoiceSeconds(discordId: string, guildId: string, seconds: number) {
    const user = await this.levelsRepository.getOrCreateUser(
      discordId,
      guildId,
      'Unknown',
    );

    return this.levelsRepository.addVoiceSeconds(user.id, guildId, seconds);
  }
}
