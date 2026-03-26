import { Injectable, OnModuleInit } from '@nestjs/common';
import { SlashCommandBuilder } from 'discord.js';
import { BadgesService } from './badges.service';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class BadgesController implements OnModuleInit {
  private slashCommands: any[] = [];

  constructor(
    private badgesService: BadgesService,
    private discordService: DiscordService,
  ) {}

  onModuleInit() {
    this.setupSlashCommands();
  }

  private setupSlashCommands() {
    this.slashCommands.push(
      new SlashCommandBuilder()
        .setName('badges')
        .setDescription('Mostra seus badges')
        .addUserOption((option) =>
          option
            .setName('usuario')
            .setDescription('Usuário (padrão: você)')
            .setRequired(false),
        )
        .toJSON(),

      new SlashCommandBuilder()
        .setName('allbadges')
        .setDescription('Lista todos os badges disponíveis')
        .toJSON(),
    );

    this.discordService.registerSlashCommands(this.slashCommands);
  }
}
