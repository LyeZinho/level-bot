import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { BotModule } from './bot/bot.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [ConfigModule, BotModule, WorkersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
