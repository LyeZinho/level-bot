import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { drizzleProvider, DRIZZLE } from './drizzle.provider';

@Module({
  imports: [ConfigModule],
  providers: [drizzleProvider],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
