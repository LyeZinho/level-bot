import { Module } from '@nestjs/common';
import { EconomyService } from './economy.service';
import { EconomyController } from './economy.controller';
import { EconomyRepository } from './economy.repository';
import { RedisModule } from '@/redis/redis.module';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [RedisModule, DiscordModule],
  providers: [EconomyService, EconomyRepository, EconomyController],
  exports: [EconomyService],
})
export class EconomyModule {}
