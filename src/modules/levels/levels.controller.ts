import { Injectable, OnModuleInit } from '@nestjs/common';
import { SlashCommandBuilder } from 'discord.js';
import { LevelsService } from './levels.service';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class LevelsController implements OnModuleInit {
  private slashCommands: any[] = [];

  constructor(
    private levelsService: LevelsService,
    private discordService: DiscordService,
  ) {}

  onModuleInit() {
    this.setupSlashCommands();
    this.setupEventHandlers();
  }

  private setupSlashCommands() {
    this.slashCommands.push(
      new SlashCommandBuilder()
        .setName('level')
        .setDescription('Mostra seu nível e XP')
        .addUserOption((option) =>
          option
            .setName('usuario')
            .setDescription('Usuário (padrão: você)')
            .setRequired(false),
        )
        .toJSON(),

      new SlashCommandBuilder()
        .setName('ranking')
        .setDescription('Mostra o ranking de níveis')
        .addNumberOption((option) =>
          option
            .setName('limite')
            .setDescription('Quantos usuários mostrar (1-100)')
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(false),
        )
        .toJSON(),
    );

    this.discordService.registerSlashCommands(this.slashCommands);
  }

  private setupEventHandlers() {
    const client = this.discordService.getClient();

    client.on('messageCreate', async (message) => {
      if (message.author.bot || !message.guild) return;

      try {
        await this.levelsService.incrementMessageCount(
          message.author.id,
          message.guildId,
        );
      } catch (error) {
        console.error('Erro ao incrementar mensagens:', error);
      }
    });
  }
}
