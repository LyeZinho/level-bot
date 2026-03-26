import { Injectable, OnModuleInit } from '@nestjs/common';
import { SlashCommandBuilder } from 'discord.js';
import { ShopService } from './shop.service';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class ShopController implements OnModuleInit {
  private slashCommands: any[] = [];

  constructor(
    private shopService: ShopService,
    private discordService: DiscordService,
  ) {}

  onModuleInit() {
    this.setupSlashCommands();
  }

  private setupSlashCommands() {
    this.slashCommands.push(
      new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Mostra a loja de itens')
        .toJSON(),
    );

    this.discordService.registerSlashCommands(this.slashCommands);
  }
}
