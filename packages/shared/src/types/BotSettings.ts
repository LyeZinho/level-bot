/**
 * Bot configuration settings managed through the admin panel.
 *
 * These settings control core bot behavior including XP rates,
 * cooldowns, and notification preferences.
 */

/** XP earning configuration for message-based activity */
export interface XPConfig {
  /** Minimum XP earned per qualifying message */
  readonly perMessageMin: number;
  /** Maximum XP earned per qualifying message */
  readonly perMessageMax: number;
  /** Cooldown in seconds between XP-eligible messages */
  readonly cooldownSeconds: number;
  /** XP earned per minute in voice channels */
  readonly perVoiceMinute: number;
}

/** Economy/coin earning configuration */
export interface CoinConfig {
  /** Number of coins earned per 100 XP */
  readonly per100XP: number;
  /** Maximum coins earnable from a single message */
  readonly maxPerMessage: number;
  /** Coins awarded for daily claim */
  readonly dailyClaim: number;
}

/** Notification delivery preferences */
export interface NotificationConfig {
  /** Channel ID for level-up announcements (empty string = disabled) */
  readonly levelUpChannelId: string;
  /** Whether to send DM notifications for level-ups */
  readonly levelUpDMEnabled: boolean;
}

/** Leveling system recalculation settings */
export interface RecalculationConfig {
  /** Interval in milliseconds between background recalculations */
  readonly intervalMs: number;
  /** Minimum voice seconds to count towards time tracking */
  readonly minVoiceSeconds: number;
}

/**
 * Complete bot settings configuration.
 *
 * Represents the full set of configurable bot parameters
 * that can be modified through the admin panel.
 */
export interface BotSettings {
  /** Unique identifier for this settings configuration */
  readonly id: string;
  /** Discord guild (server) ID these settings apply to */
  readonly guildId: string;
  /** Command prefix for text-based commands */
  readonly prefix: string;
  /** XP earning rates and cooldowns */
  readonly xp: XPConfig;
  /** Economy/coin configuration */
  readonly coins: CoinConfig;
  /** Notification delivery settings */
  readonly notifications: NotificationConfig;
  /** Background recalculation settings */
  readonly recalculation: RecalculationConfig;
  /** List of allowed guild IDs for multi-guild setups */
  readonly allowedGuildIds: readonly string[];
  /** ISO 8601 timestamp of last update */
  readonly updatedAt: string;
  /** Discord user ID of the admin who last modified settings */
  readonly updatedBy: string;
}
