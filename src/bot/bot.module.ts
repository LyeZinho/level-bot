import { Module } from '@nestjs/common';
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { CacheModule } from '../cache/cache.module';
import { LevelingModule } from '../leveling/leveling.module';
import { EconomyModule } from '../economy/economy.module';
import { VipModule } from '../vip/vip.module';
import { BadgesModule } from '../badges/badges.module';
import { SeasonalModule } from '../seasonal/seasonal.module';
import { UtilsModule } from '../utils/utils.module';
import { CommandsModule } from './commands/commands.module';
import { TextCommandsModule } from './text-commands/text-commands.module';

@Module({
  imports: [
    NecordModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('DISCORD_TOKEN');
        if (!token) {
          throw new Error('DISCORD_TOKEN is not set');
        }
        return {
          token,
          intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.DirectMessages,
            IntentsBitField.Flags.MessageContent,
            IntentsBitField.Flags.GuildVoiceStates,
          ],
          prefix: configService.get<string>('PREFIX') || '!',
        };
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
    CacheModule,
    LevelingModule,
    EconomyModule,
    VipModule,
    BadgesModule,
    SeasonalModule,
    UtilsModule,
    CommandsModule,
    TextCommandsModule,
  ],
  controllers: [],
  providers: [],
})
export class BotModule {}
