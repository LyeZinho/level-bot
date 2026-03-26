import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryRepository } from './inventory.repository';
import { RedisModule } from '@/redis/redis.module';
import { DiscordModule } from '../discord/discord.module';
import { EconomyModule } from '../economy/economy.module';

@Module({
  imports: [RedisModule, DiscordModule, EconomyModule],
  providers: [InventoryService, InventoryRepository, InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
