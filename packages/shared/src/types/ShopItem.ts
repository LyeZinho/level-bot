/**
 * Shop item types and interfaces for the bot economy system.
 *
 * Represents items available for purchase with PityCoins,
 * including consumables, cosmetics, mystery boxes, and role rewards.
 */

/** Categories of items available in the shop */
export enum ShopItemType {
  /** Single-use items like XP potions and temporary boosts */
  Consumable = 'consumable',
  /** Decorative items like badges and profile customizations */
  Cosmetic = 'cosmetic',
  /** Random reward containers */
  MysteryBox = 'mystery_box',
  /** Special items granting Discord roles or channel access */
  Special = 'special',
  /** Items providing role-based perks and benefits */
  Role = 'role',
}

/**
 * A purchasable item in the shop.
 *
 * Maps to the `items` database table. Used across the bot,
 * API, and admin panel for displaying and managing shop inventory.
 */
export interface ShopItem {
  /** Auto-incrementing primary key */
  readonly itemId: number;
  /** Display name of the item (unique) */
  readonly name: string;
  /** Detailed description of what the item does */
  readonly description: string | null;
  /** Price in PityCoins */
  readonly price: number;
  /** Emoji displayed alongside the item */
  readonly emoji: string | null;
  /** Category classification */
  readonly type: ShopItemType;
  /** Whether the item is hidden from the public shop listing */
  readonly hidden: boolean;
  /** ISO 8601 timestamp when the item was created */
  readonly createdAt: string;
}

/** Fields required to create a new shop item */
export interface ShopItemCreate {
  readonly name: string;
  readonly description?: string;
  readonly price: number;
  readonly emoji?: string;
  readonly type: ShopItemType;
  readonly hidden?: boolean;
}

/** Fields that can be updated on an existing shop item */
export interface ShopItemUpdate {
  readonly name?: string;
  readonly description?: string | null;
  readonly price?: number;
  readonly emoji?: string | null;
  readonly type?: ShopItemType;
  readonly hidden?: boolean;
}

/**
 * A user's inventory entry for a specific item.
 *
 * Maps to the `user_inventory` database table.
 */
export interface UserInventoryItem {
  /** Auto-incrementing primary key */
  readonly id: number;
  /** Discord user ID of the owner */
  readonly userId: string;
  /** Discord guild ID */
  readonly guildId: string;
  /** Reference to the shop item */
  readonly itemId: number;
  /** Number of this item owned */
  readonly quantity: number;
  /** ISO 8601 timestamp when the item was acquired */
  readonly acquiredAt: string;
}
