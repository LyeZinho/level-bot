import { Module } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { MissionsController } from './missions.controller';
import { MissionsRepository } from './missions.repository';
import { RedisModule } from '@/redis/redis.module';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [RedisModule, DiscordModule],
  providers: [MissionsService, MissionsRepository, MissionsController],
  exports: [MissionsService],
})
export class MissionsModule {}
