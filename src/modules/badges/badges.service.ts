import { Injectable } from '@nestjs/common';
import { BadgesRepository } from './badges.repository';
import { RedisService } from '@/redis/redis.service';
import { AwardBadgeDto } from './dto/award-badge.dto';
import { GetBadgesDto } from './dto/get-badges.dto';
import { db } from '@/database/db';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class BadgesService {
  constructor(
    private badgesRepository: BadgesRepository,
    private redisService: RedisService,
  ) {}

  async awardBadge(dto: AwardBadgeDto) {
    const userData = await db.query.users.findFirst({
      where: eq(users.discordId, dto.discordId),
    });

    if (!userData) throw new Error('Usuário não encontrado');

    const badge = await this.badgesRepository.getOrCreateBadge(
      dto.badgeName,
      '🏅',
      'common',
    );

    const result = await this.badgesRepository.awardBadge(userData.id, badge.id);
    await this.redisService.invalidatePattern(`badges:${userData.id}:*`);

    return result;
  }

  async getUserBadges(dto: GetBadgesDto) {
    const cacheKey = `badges:${dto.discordId}:${dto.guildId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const userData = await db.query.users.findFirst({
      where: eq(users.discordId, dto.discordId),
    });

    if (!userData) throw new Error('Usuário não encontrado');

    const userBadges = await this.badgesRepository.getUserBadges(userData.id);
    await this.redisService.set(cacheKey, userBadges, 600);

    return userBadges;
  }

  async getAllBadges() {
    const cached = await this.redisService.get('badges:all');
    if (cached) return cached;

    const allBadges = await this.badgesRepository.getAllBadges();
    await this.redisService.set('badges:all', allBadges, 3600);

    return allBadges;
  }
}
