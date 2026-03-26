import { Injectable } from '@nestjs/common';
import { EconomyRepository } from './economy.repository';
import { RedisService } from '@/redis/redis.service';
import { AddCoinsDto } from './dto/add-coins.dto';
import { TransferCoinsDto } from './dto/transfer-coins.dto';
import { DailyRewardDto, DAILY_REWARD_AMOUNT, DAILY_REWARD_COOLDOWN_HOURS } from './dto/daily-reward.dto';
import { db } from '@/database/db';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class EconomyService {
  constructor(
    private economyRepository: EconomyRepository,
    private redisService: RedisService,
  ) {}

  async addCoins(dto: AddCoinsDto) {
    // Get or create user first via the database query
    const userData = await db.query.users.findFirst({
      where: eq(users.discordId, dto.discordId),
    });
    
    let userId: number;
    if (!userData) {
      const [newUser] = await db
        .insert(users)
        .values({
          discordId: dto.discordId,
          guildId: dto.guildId,
          username: 'Unknown',
        })
        .returning();
      userId = newUser.id;
    } else {
      userId = userData.id;
    }

    const updated = await this.economyRepository.addCoins(userId, dto.guildId, dto.amount);
    await this.redisService.invalidatePattern(`coins:${userId}:*`);

    return updated;
  }

  async transferCoins(dto: TransferCoinsDto) {
    // Get from user
    const fromUserData = await db.query.users.findFirst({
      where: eq(users.discordId, dto.fromDiscordId),
    });
    if (!fromUserData) throw new Error('Usuário remetente não encontrado');

    // Get to user
    const toUserData = await db.query.users.findFirst({
      where: eq(users.discordId, dto.toDiscordId),
    });
    if (!toUserData) throw new Error('Usuário destinatário não encontrado');

    // Transfer
    await this.economyRepository.removeCoins(fromUserData.id, dto.guildId, dto.amount);
    const result = await this.economyRepository.addCoins(toUserData.id, dto.guildId, dto.amount);

    // Invalidate cache
    await this.redisService.invalidatePattern(`coins:${fromUserData.id}:*`);
    await this.redisService.invalidatePattern(`coins:${toUserData.id}:*`);

    return result;
  }

  async claimDaily(dto: DailyRewardDto) {
    const userData = await db.query.users.findFirst({
      where: eq(users.discordId, dto.discordId),
    });
    
    if (!userData) throw new Error('Usuário não encontrado');

    const coins = await this.economyRepository.getUserCoins(userData.id, dto.guildId);
    if (!coins) throw new Error('Coins não encontrado');

    const lastDaily = coins.lastDailyAt;
    if (lastDaily) {
      const hoursSinceDaily = (Date.now() - lastDaily.getTime()) / (1000 * 60 * 60);
      if (hoursSinceDaily < DAILY_REWARD_COOLDOWN_HOURS) {
        throw new Error(`Daily cooldown. Próximo em ${Math.ceil(DAILY_REWARD_COOLDOWN_HOURS - hoursSinceDaily)}h`);
      }
    }

    const updated = await this.economyRepository.claimDaily(userData.id, dto.guildId, DAILY_REWARD_AMOUNT);
    await this.redisService.invalidatePattern(`coins:${userData.id}:*`);

    return updated;
  }

  async getUserCoins(discordId: string, guildId: string) {
    const cacheKey = `coins:${discordId}:${guildId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const userData = await db.query.users.findFirst({
      where: eq(users.discordId, discordId),
    });
    
    if (!userData) throw new Error('Usuário não encontrado');

    const coins = await this.economyRepository.getUserCoins(userData.id, guildId);
    await this.redisService.set(cacheKey, coins, 120);

    return coins;
  }
}
