import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscordService } from '../discord.service';

@Injectable()
export class MessageCreateEventHandler implements OnModuleInit {
  constructor(private discordService: DiscordService) {}

  onModuleInit() {
    const client = this.discordService.getClient();
    
    client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      // Prefix commands will be implemented in specific modules
    });
  }
}
