import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscordService } from '../discord.service';

@Injectable()
export class ReadyEventHandler implements OnModuleInit {
  constructor(private discordService: DiscordService) {}

  onModuleInit() {
    const client = this.discordService.getClient();
    
    client.once('ready', (readyClient) => {
      console.log(`✅ Bot pronto como ${readyClient.user.tag}`);
    });
  }
}
