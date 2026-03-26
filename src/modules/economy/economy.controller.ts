import { Injectable, OnModuleInit } from '@nestjs/common';
import { SlashCommandBuilder } from 'discord.js';
import { EconomyService } from './economy.service';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class EconomyController implements OnModuleInit {
  private slashCommands: any[] = [];

  constructor(
    private economyService: EconomyService,
    private discordService: DiscordService,
  ) {}

  onModuleInit() {
    this.setupSlashCommands();
  }

  private setupSlashCommands() {
    this.slashCommands.push(
      new SlashCommandBuilder()
        .setName('coins')
        .setDescription('Mostra seu saldo de coins')
        .addUserOption((option) =>
          option
            .setName('usuario')
            .setDescription('Usuário (padrão: você)')
            .setRequired(false),
        )
        .toJSON(),

      new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Reivindica sua recompensa diária')
        .toJSON(),

      new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Transfere coins para outro usuário')
        .addUserOption((option) =>
          option
            .setName('usuario')
            .setDescription('Usuário destino')
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName('quantidade')
            .setDescription('Quantidade de coins')
            .setRequired(true),
        )
        .toJSON(),
    );

    this.discordService.registerSlashCommands(this.slashCommands);
  }
}
