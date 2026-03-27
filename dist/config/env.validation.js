"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const Joi = __importStar(require("joi"));
exports.envSchema = Joi.object({
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
//# sourceMappingURL=env.validation.js.map