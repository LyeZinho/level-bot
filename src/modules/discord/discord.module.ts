import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordService } from './discord.service';
import { RedisModule } from '@/redis/redis.module';
import { ReadyEventHandler } from './events/ready.event';
import { MessageCreateEventHandler } from './events/message-create.event';
import { VoiceStateUpdateEventHandler } from './events/voice-state-update.event';

@Module({
  imports: [ConfigModule, RedisModule],
  providers: [DiscordService, ReadyEventHandler, MessageCreateEventHandler, VoiceStateUpdateEventHandler],
  exports: [DiscordService],
})
export class DiscordModule {}
