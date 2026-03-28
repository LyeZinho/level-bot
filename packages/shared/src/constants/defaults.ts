import type { XPConfig, CoinConfig, RecalculationConfig } from '../types/BotSettings.js';
import type { VIPTierMap } from '../types/VIPTier.js';
import { VIPTierKey } from '../types/VIPTier.js';

export const DEFAULT_PREFIX = '!';

export const DEFAULT_XP_CONFIG: XPConfig = {
  perMessageMin: 15,
  perMessageMax: 25,
  cooldownSeconds: 60,
  perVoiceMinute: 1,
} as const;

export const DEFAULT_COIN_CONFIG: CoinConfig = {
  per100XP: 1,
  maxPerMessage: 25,
  dailyClaim: 100,
} as const;

export const DEFAULT_RECALCULATION_CONFIG: RecalculationConfig = {
  intervalMs: 300_000,
  minVoiceSeconds: 60,
} as const;

export const DEFAULT_VIP_TIERS: VIPTierMap = {
  [VIPTierKey.Gold]: {
    name: 'Gold',
    multiplier: 2,
    roleId: '',
    price: 600,
    durationDays: 30,
  },
  [VIPTierKey.Platinum]: {
    name: 'Platinum',
    multiplier: 3,
    roleId: '',
    price: 1200,
    durationDays: 30,
  },
  [VIPTierKey.Ruby]: {
    name: 'Ruby',
    multiplier: 5,
    roleId: '',
    price: 3000,
    durationDays: 30,
  },
} as const;

export const DEFAULT_DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  name: 'levelbot',
  user: 'levelbot',
} as const;

export const DEFAULT_REDIS_CONFIG = {
  host: 'localhost',
  port: 6379,
} as const;

export const DEFAULT_API_PORT = 3000;
