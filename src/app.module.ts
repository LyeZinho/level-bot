import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './cache/cache.module';
import { LevelingModule } from './leveling/leveling.module';
import { EconomyModule } from './economy/economy.module';
import { VipModule } from './vip/vip.module';

@Module({
  imports: [ConfigModule, DatabaseModule, CacheModule, LevelingModule, EconomyModule, VipModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
