import { registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis', () => ({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  ttlUserData: 300, // 5 minutes
  ttlRanking: 600, // 10 minutes
  ttlCoins: 120, // 2 minutes
  ttlProfile: 3600, // 1 hour
}));
