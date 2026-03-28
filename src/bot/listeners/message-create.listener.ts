import { Injectable } from '@nestjs/common';
import { On, Context } from 'necord';
import { Message } from 'discord.js';
import { LevelingService } from '../../leveling/leveling.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MessageCreateListener {
  constructor(
    private levelingService: LevelingService,
    private configService: ConfigService,
  ) {}

  @On('messageCreate')
  async onMessageCreate(
    @Context() [message]: [Message],
  ): Promise<void> {
    if (message.author.bot || !message.guild || !message.guildId) {
      return;
    }

    const allowedGuildIds = this.configService.get<string>('ALLOWED_GUILD_IDS')?.split(',') || [];
    if (!allowedGuildIds.includes(message.guildId)) {
      return;
    }

    try {
      const xpGain = Math.floor(Math.random() * 25) + 10;
      await this.levelingService.addMessageXP(
        message.author.id,
        message.author.username,
        message.guildId,
        xpGain,
      );
    } catch (error) {
      console.error('Error in messageCreate listener:', error);
    }
  }
}
