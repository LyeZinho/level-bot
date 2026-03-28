/**
 * Badge system types for achievement tracking and display.
 *
 * Badges are earned through missions, seasonal events,
 * or administrative grants. They display on user profiles.
 */

/** Classification of badge types */
export enum BadgeType {
  /** Badges earned through completing missions */
  Mission = 'mission',
  /** Time-limited badges from seasonal events */
  Seasonal = 'seasonal',
  /** Badges awarded by administrators */
  Special = 'special',
  /** Badges earned by reaching specific levels */
  Level = 'level',
  /** Badges earned through general activity milestones */
  Achievement = 'achievement',
}

/** Rarity tiers for badges */
export enum BadgeTier {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary',
}

/**
 * A badge definition in the system.
 *
 * Maps to the `badges` database table. Defines what a badge
 * looks like, its type, and any expiration rules.
 */
export interface Badge {
  /** Auto-incrementing primary key */
  readonly badgeId: number;
  /** Display name of the badge (unique) */
  readonly name: string;
  /** File path or URL to the badge image */
  readonly imagePath: string | null;
  /** Classification of how the badge is earned */
  readonly badgeType: BadgeType;
  /** Rarity tier affecting display and sorting */
  readonly tier: BadgeTier | null;
  /** ISO 8601 timestamp when the badge expires (null = permanent) */
  readonly expiresAt: string | null;
  /** ISO 8601 timestamp when the badge was created */
  readonly createdAt: string;
}

/** Fields required to create a new badge */
export interface BadgeCreate {
  readonly name: string;
  readonly imagePath?: string;
  readonly badgeType: BadgeType;
  readonly tier?: BadgeTier;
  readonly expiresAt?: string;
}

/** Fields that can be updated on an existing badge */
export interface BadgeUpdate {
  readonly name?: string;
  readonly imagePath?: string | null;
  readonly badgeType?: BadgeType;
  readonly tier?: BadgeTier | null;
  readonly expiresAt?: string | null;
}

/**
 * A badge earned by a specific user.
 *
 * Maps to the `user_badges` database table.
 */
export interface UserBadge {
  /** Auto-incrementing primary key */
  readonly id: number;
  /** Discord user ID */
  readonly userId: string;
  /** Discord guild ID */
  readonly guildId: string;
  /** Reference to the badge definition */
  readonly badgeId: number;
  /** ISO 8601 timestamp when the badge was earned */
  readonly earnedAt: string;
  /** ISO 8601 timestamp when this specific award expires (null = follows badge default) */
  readonly expiresAt: string | null;
}
