/**
 * User data types representing Discord server members in the leveling system.
 *
 * Maps to the `users` database table and provides typed
 * representations for API responses and admin panel views.
 */

/**
 * A user's leveling and economy data within a guild.
 *
 * Maps to the `users` database table. Represents the core
 * progression data tracked for each Discord server member.
 */
export interface GuildUser {
  /** Discord snowflake user ID */
  readonly userId: string;
  /** Discord guild ID */
  readonly guildId: string;
  /** Total accumulated experience points */
  readonly xp: number;
  /** Current calculated level */
  readonly level: number;
  /** Total messages sent in tracked channels */
  readonly messages: number;
  /** Total seconds spent in voice channels */
  readonly voiceTime: number;
  /** PityCoin balance */
  readonly coins: number;
  /** ISO 8601 timestamp of last daily coin claim (null if never claimed) */
  readonly lastDailyClaimAt: string | null;
  /** ISO 8601 timestamp when the user was first tracked */
  readonly createdAt: string;
}

/**
 * Mission definition for tracked objectives.
 *
 * Maps to the `missions` database table.
 */
export interface Mission {
  /** Auto-incrementing primary key */
  readonly missionId: number;
  /** Type of mission (e.g., 'messages', 'voice_time', 'level') */
  readonly missionType: string;
  /** Target value to reach for completion */
  readonly targetValue: number;
  /** Badge awarded on completion */
  readonly rewardBadgeId: number;
  /** Coins awarded on completion */
  readonly rewardCoins: number;
  /** Human-readable mission description */
  readonly description: string | null;
  /** ISO 8601 timestamp when the mission was created */
  readonly createdAt: string;
}

/**
 * A user's progress on a specific mission.
 *
 * Maps to the `user_missions` database table.
 */
export interface UserMission {
  /** Auto-incrementing primary key */
  readonly id: number;
  /** Discord user ID */
  readonly userId: string;
  /** Discord guild ID */
  readonly guildId: string;
  /** Reference to the mission definition */
  readonly missionId: number;
  /** Current progress towards the target value */
  readonly currentValue: number;
  /** Whether the mission has been completed */
  readonly completed: boolean;
  /** ISO 8601 timestamp when the mission was completed (null if incomplete) */
  readonly completedAt: string | null;
  /** ISO 8601 timestamp when the user started this mission */
  readonly startedAt: string;
}
