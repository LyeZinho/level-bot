import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { ShopRepository } from './shop.repository';
import { RedisModule } from '@/redis/redis.module';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [RedisModule, DiscordModule],
  providers: [ShopService, ShopRepository, ShopController],
  exports: [ShopService],
})
export class ShopModule {}
