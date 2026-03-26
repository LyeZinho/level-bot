import { Injectable, OnModuleInit } from '@nestjs/common';
import { SlashCommandBuilder } from 'discord.js';
import { MissionsService } from './missions.service';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class MissionsController implements OnModuleInit {
  private slashCommands: any[] = [];

  constructor(
    private missionsService: MissionsService,
    private discordService: DiscordService,
  ) {}

  onModuleInit() {
    this.setupSlashCommands();
  }

  private setupSlashCommands() {
    this.slashCommands.push(
      new SlashCommandBuilder()
        .setName('missions')
        .setDescription('Mostra suas missions')
        .addUserOption((option) =>
          option
            .setName('usuario')
            .setDescription('Usuário (padrão: você)')
            .setRequired(false),
        )
        .toJSON(),

      new SlashCommandBuilder()
        .setName('allmissions')
        .setDescription('Lista todas as missions disponíveis')
        .toJSON(),
    );

    this.discordService.registerSlashCommands(this.slashCommands);
  }
}
