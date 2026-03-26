import { Injectable } from '@nestjs/common';
import { InventoryRepository } from './inventory.repository';
import { RedisService } from '@/redis/redis.service';
import { EconomyRepository } from '../economy/economy.repository';
import { BuyItemDto } from './dto/buy-item.dto';
import { UseItemDto } from './dto/use-item.dto';
import { GetInventoryDto } from './dto/get-inventory.dto';
import { db } from '@/database/db';
import { users, items } from '@/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class InventoryService {
  constructor(
    private inventoryRepository: InventoryRepository,
    private redisService: RedisService,
    private economyRepository: EconomyRepository,
  ) {}

  async buyItem(dto: BuyItemDto) {
    const userData = await db.query.users.findFirst({
      where: eq(users.discordId, dto.discordId),
    });

    if (!userData) throw new Error('Usuário não encontrado');

    const item = await db.query.items.findFirst({
      where: eq(items.id, dto.itemId),
    });

    if (!item) throw new Error('Item não encontrado');

    const totalCost = item.price * dto.quantity;

    // Deduct coins
    await this.economyRepository.removeCoins(userData.id, dto.guildId, totalCost);

    // Add to inventory
    const result = await this.inventoryRepository.addItem(userData.id, dto.itemId, dto.quantity);
    await this.redisService.invalidatePattern(`inventory:${userData.id}:*`);

    return result;
  }

  async getUserInventory(dto: GetInventoryDto) {
    const cacheKey = `inventory:${dto.discordId}:${dto.guildId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const userData = await db.query.users.findFirst({
      where: eq(users.discordId, dto.discordId),
    });

    if (!userData) throw new Error('Usuário não encontrado');

    const inventory = await this.inventoryRepository.getUserInventory(userData.id);
    await this.redisService.set(cacheKey, inventory, 300);

    return inventory;
  }

  async useItem(dto: UseItemDto) {
    const userData = await db.query.users.findFirst({
      where: eq(users.discordId, dto.discordId),
    });

    if (!userData) throw new Error('Usuário não encontrado');

    const result = await this.inventoryRepository.useItem(userData.id, dto.itemId);
    await this.redisService.invalidatePattern(`inventory:${userData.id}:*`);

    return result;
  }
}
