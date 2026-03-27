import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envSchema } from './env.validation';

@Module({
  imports: [
    NestConfigModule.forRoot({
      validationSchema: envSchema,
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
  ],
})
export class ConfigModule {}
