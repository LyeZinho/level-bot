import * as Joi from 'joi';

export const envSchema = Joi.object({
  // Discord
  DISCORD_TOKEN: Joi.string().required().messages({
    'string.empty': 'DISCORD_TOKEN must not be empty',
  }),
  CLIENT_ID: Joi.string().required().messages({
    'string.empty': 'CLIENT_ID must not be empty',
  }),
  GUILD_ID: Joi.string().required().messages({
    'string.empty': 'GUILD_ID must not be empty',
  }),
  PREFIX: Joi.string().default('!').messages({
    'string.empty': 'PREFIX must not be empty',
  }),
  
  // PostgreSQL
  DB_HOST: Joi.string().default('localhost').messages({
    'string.empty': 'DB_HOST must not be empty',
  }),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().default('levelbot').messages({
    'string.empty': 'DB_NAME must not be empty',
  }),
  DB_USER: Joi.string().default('levelbot').messages({
    'string.empty': 'DB_USER must not be empty',
  }),
  DB_PASSWORD: Joi.string().default('levelbot123').messages({
    'string.empty': 'DB_PASSWORD must not be empty',
  }),
  
  // Redis
  REDIS_HOST: Joi.string().default('localhost').messages({
    'string.empty': 'REDIS_HOST must not be empty',
  }),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),
  
  // Server
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  
  // Bot Settings
  LEVEL_RECALC_INTERVAL_MS: Joi.number().default(300000),
  MIN_VOICE_SECONDS: Joi.number().default(60),
  
  // Features
  ALLOWED_GUILD_IDS: Joi.string().default('832509216895926314,963393023486590978').messages({
    'string.empty': 'ALLOWED_GUILD_IDS must not be empty',
  }),
  ROBUX_REDEMPTION_CHANNEL_ID: Joi.string().default('1454206289029759138').messages({
    'string.empty': 'ROBUX_REDEMPTION_CHANNEL_ID must not be empty',
  }),
  LEVEL_UP_NOTIFICATION_CHANNEL_ID: Joi.string().default('1449807035389579407').messages({
    'string.empty': 'LEVEL_UP_NOTIFICATION_CHANNEL_ID must not be empty',
  }),
})
  .unknown(true);
