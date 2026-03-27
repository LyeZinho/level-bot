import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './cache/cache.module';
import { LevelingModule } from './leveling/leveling.module';

@Module({
  imports: [ConfigModule, DatabaseModule, CacheModule, LevelingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
