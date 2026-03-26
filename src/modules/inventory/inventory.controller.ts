import { Injectable, OnModuleInit } from '@nestjs/common';
import { SlashCommandBuilder } from 'discord.js';
import { InventoryService } from './inventory.service';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class InventoryController implements OnModuleInit {
  private slashCommands: any[] = [];

  constructor(
    private inventoryService: InventoryService,
    private discordService: DiscordService,
  ) {}

  onModuleInit() {
    this.setupSlashCommands();
  }

  private setupSlashCommands() {
    this.slashCommands.push(
      new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Compra um item da loja')
        .addIntegerOption((option) =>
          option
            .setName('item_id')
            .setDescription('ID do item')
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName('quantidade')
            .setDescription('Quantidade (padrão: 1)')
            .setRequired(false),
        )
        .toJSON(),

      new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Mostra seu inventário')
        .addUserOption((option) =>
          option
            .setName('usuario')
            .setDescription('Usuário (padrão: você)')
            .setRequired(false),
        )
        .toJSON(),

      new SlashCommandBuilder()
        .setName('use')
        .setDescription('Usa um item do inventário')
        .addIntegerOption((option) =>
          option
            .setName('item_id')
            .setDescription('ID do item')
            .setRequired(true),
        )
        .toJSON(),
    );

    this.discordService.registerSlashCommands(this.slashCommands);
  }
}
