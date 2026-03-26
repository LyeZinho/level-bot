import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { BadgesRepository } from './badges.repository';
import { RedisModule } from '@/redis/redis.module';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [RedisModule, DiscordModule],
  providers: [BadgesService, BadgesRepository, BadgesController],
  exports: [BadgesService],
})
export class BadgesModule {}
