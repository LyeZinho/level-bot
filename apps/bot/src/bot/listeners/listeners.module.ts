import { Module } from '@nestjs/common';
import { LevelingModule } from '../../leveling/leveling.module';
import { MessageCreateListener } from './message-create.listener';
import { VoiceStateUpdateListener } from './voice-state-update.listener';

@Module({
  imports: [LevelingModule],
  providers: [MessageCreateListener, VoiceStateUpdateListener],
})
export class ListenersModule {}
