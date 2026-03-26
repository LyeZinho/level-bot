import { Module } from '@nestjs/common';
import { LevelsService } from './levels.service';
import { LevelsController } from './levels.controller';
import { LevelsRepository } from './levels.repository';
import { RedisModule } from '@/redis/redis.module';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [RedisModule, DiscordModule],
  providers: [LevelsService, LevelsRepository, LevelsController],
  exports: [LevelsService],
})
export class LevelsModule {}
