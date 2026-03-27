import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './cache/cache.module';
import { LevelingModule } from './leveling/leveling.module';
import { EconomyModule } from './economy/economy.module';
import { VipModule } from './vip/vip.module';
import { BadgesModule } from './badges/badges.module';
import { SeasonalModule } from './seasonal/seasonal.module';

@Module({
  imports: [ConfigModule, DatabaseModule, CacheModule, LevelingModule, EconomyModule, VipModule, BadgesModule, SeasonalModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
