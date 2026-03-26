import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordService implements OnModuleInit {
  private client: Client;

  constructor(private configService: ConfigService) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
      ],
    });
  }

  async onModuleInit() {
    await this.setupEventHandlers();
    await this.login();
  }

  private async setupEventHandlers() {
    // Event handlers will be registered by modules
  }

  private async login() {
    const token = this.configService.get<string>('DISCORD_TOKEN');
    if (!token) {
      throw new Error('DISCORD_TOKEN não configurado');
    }
    await this.client.login(token);
    console.log('✅ Bot Discord conectado');
  }

  getClient(): Client {
    return this.client;
  }

  async registerSlashCommands(commands: any[]) {
    const rest = new REST({ version: '10' }).setToken(
      this.configService.get<string>('DISCORD_TOKEN'),
    );

    try {
      console.log('🔄 Registrando slash commands...');
      const guildId = this.configService.get<string>('GUILD_ID');
      await rest.put(
        Routes.applicationGuildCommands(
          this.configService.get<string>('CLIENT_ID'),
          guildId,
        ),
        { body: commands },
      );
      console.log(`✅ ${commands.length} slash commands registrados`);
    } catch (error) {
      console.error('❌ Erro ao registrar commands:', error);
    }
  }
}
