/**
 * VIP tier system types for premium subscriptions.
 *
 * VIP tiers provide XP multipliers and special Discord roles
 * for a defined duration. Managed through the economy system.
 */

/** Available VIP tier identifiers */
export enum VIPTierKey {
  Gold = 'gold',
  Platinum = 'platinum',
  Ruby = 'ruby',
}

/**
 * Configuration for a single VIP tier.
 *
 * Defines the benefits, pricing, and Discord integration
 * for a VIP subscription level.
 */
export interface VIPTierConfig {
  /** Human-readable display name */
  readonly name: string;
  /** XP earning multiplier (e.g., 2 = double XP) */
  readonly multiplier: number;
  /** Discord role ID assigned to subscribers of this tier */
  readonly roleId: string;
  /** Cost in PityCoins to purchase this tier */
  readonly price: number;
  /** Subscription duration in days */
  readonly durationDays: number;
}

/** Map of all VIP tier configurations keyed by tier identifier */
export type VIPTierMap = Record<VIPTierKey, VIPTierConfig>;

/**
 * A user's active VIP subscription.
 *
 * Maps to the `user_vips` database table.
 */
export interface UserVIP {
  /** Discord user ID */
  readonly userId: string;
  /** Discord guild ID */
  readonly guildId: string;
  /** VIP tier identifier */
  readonly tier: string;
  /** XP multiplier granted by this subscription */
  readonly multiplier: number;
  /** ISO 8601 timestamp when the subscription expires */
  readonly expiresAt: string;
  /** Whether the subscription is currently active */
  readonly active: boolean;
  /** ISO 8601 timestamp when the subscription was created */
  readonly createdAt: string;
}

/**
 * A user's active temporary XP boost.
 *
 * Maps to the `user_boosts` database table.
 * Boosts stack with VIP multipliers.
 */
export interface UserBoost {
  /** Discord user ID */
  readonly userId: string;
  /** Discord guild ID */
  readonly guildId: string;
  /** Type of boost (e.g., 'xp_potion', 'event_boost') */
  readonly boostType: string;
  /** XP multiplier provided by this boost */
  readonly multiplier: number;
  /** ISO 8601 timestamp when the boost expires */
  readonly expiresAt: string;
  /** ISO 8601 timestamp when the boost was applied */
  readonly createdAt: string;
}
