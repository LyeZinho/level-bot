/**
 * Seasonal event types for time-limited bot activities.
 *
 * Events run during specific date ranges and provide special
 * rewards like exclusive badges, coins, and items.
 */

/**
 * Reward configuration for a seasonal event.
 *
 * Defines what participants receive upon successful
 * completion of the event activity.
 */
export interface SeasonalEventReward {
  /** Name of the badge awarded (must match a badge in the system) */
  readonly badge_name: string;
  /** Item IDs awarded as part of the event */
  readonly items: readonly number[];
  /** Bonus PityCoins awarded */
  readonly coins: number;
}

/**
 * A seasonal event configuration.
 *
 * Defines time-limited activities with special triggers,
 * reaction-based participation, and exclusive rewards.
 */
export interface SeasonalEvent {
  /** Unique event identifier (e.g., 'natal_2025') */
  readonly event_id: string;
  /** Human-readable event name */
  readonly name: string;
  /** Description of the event and how to participate */
  readonly description: string;
  /** ISO 8601 timestamp when the event starts */
  readonly start_date: string;
  /** ISO 8601 timestamp when the event ends */
  readonly end_date: string;
  /** Probability (0-1) of the event triggering per qualifying action */
  readonly trigger_chance: number;
  /** Message displayed when the event triggers in a channel */
  readonly message: string;
  /** Discord emoji used for participation reactions */
  readonly reaction_emoji: string;
  /** Message shown when the reaction window expires */
  readonly error_message: string;
  /** Milliseconds users have to react */
  readonly reaction_timeout: number;
  /** Rewards for successful participation */
  readonly rewards: SeasonalEventReward;
  /** Whether the event is currently enabled */
  readonly active: boolean;
  /** Minimum milliseconds between event triggers per user */
  readonly cooldown_per_user: number;
}

/** Fields required to create a new seasonal event */
export interface SeasonalEventCreate {
  readonly event_id: string;
  readonly name: string;
  readonly description: string;
  readonly start_date: string;
  readonly end_date: string;
  readonly trigger_chance: number;
  readonly message: string;
  readonly reaction_emoji: string;
  readonly error_message: string;
  readonly reaction_timeout: number;
  readonly rewards: SeasonalEventReward;
  readonly active?: boolean;
  readonly cooldown_per_user: number;
}

/** Fields that can be updated on an existing seasonal event */
export interface SeasonalEventUpdate {
  readonly name?: string;
  readonly description?: string;
  readonly start_date?: string;
  readonly end_date?: string;
  readonly trigger_chance?: number;
  readonly message?: string;
  readonly reaction_emoji?: string;
  readonly error_message?: string;
  readonly reaction_timeout?: number;
  readonly rewards?: SeasonalEventReward;
  readonly active?: boolean;
  readonly cooldown_per_user?: number;
}
