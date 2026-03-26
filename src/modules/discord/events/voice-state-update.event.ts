import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscordService } from '../discord.service';

@Injectable()
export class VoiceStateUpdateEventHandler implements OnModuleInit {
  constructor(private discordService: DiscordService) {}

  onModuleInit() {
    const client = this.discordService.getClient();
    
    client.on('voiceStateUpdate', async (oldState, newState) => {
      // Voice tracking will be implemented in levels module
    });
  }
}
