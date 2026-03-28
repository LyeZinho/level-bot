export const DEFAULT_CHANNEL_TYPES = {
  LEVEL_UP_NOTIFICATIONS: 'level_up_notifications',
  ROBUX_REDEMPTION: 'robux_redemption',
  BOT_COMMANDS: 'bot_commands',
  ADMIN_LOGS: 'admin_logs',
  SEASONAL_EVENTS: 'seasonal_events',
} as const;

export type ChannelType = (typeof DEFAULT_CHANNEL_TYPES)[keyof typeof DEFAULT_CHANNEL_TYPES];

export const CHANNEL_DESCRIPTIONS: Record<ChannelType, string> = {
  [DEFAULT_CHANNEL_TYPES.LEVEL_UP_NOTIFICATIONS]: 'Channel for level-up announcements',
  [DEFAULT_CHANNEL_TYPES.ROBUX_REDEMPTION]: 'Channel for Robux redemption requests',
  [DEFAULT_CHANNEL_TYPES.BOT_COMMANDS]: 'Primary channel for bot command usage',
  [DEFAULT_CHANNEL_TYPES.ADMIN_LOGS]: 'Channel for admin action audit logs',
  [DEFAULT_CHANNEL_TYPES.SEASONAL_EVENTS]: 'Channel for seasonal event triggers',
} as const;
