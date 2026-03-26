import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from './modules/discord/discord.module';
import { LevelsModule } from './modules/levels/levels.module';
import { EconomyModule } from './modules/economy/economy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DiscordModule,
    LevelsModule,
    EconomyModule,
  ],
})
export class AppModule {}
