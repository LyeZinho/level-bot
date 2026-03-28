import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [ConfigModule, BotModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
