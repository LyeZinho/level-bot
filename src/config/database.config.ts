import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://levelbot:levelbot123@localhost:5432/levelbot',
  migrationsPath: './drizzle/migrations',
}));
