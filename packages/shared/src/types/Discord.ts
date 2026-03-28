/**
 * Discord API-related types used across the monorepo.
 *
 * Provides typed representations of Discord user and guild
 * data as returned by the Discord REST API.
 */

/**
 * Discord user data from the API.
 *
 * Represents the essential fields from a Discord user object.
 * Used for displaying user info in the admin panel.
 */
export interface DiscordUser {
  /** Discord snowflake user ID */
  readonly id: string;
  /** Username (without discriminator in new username system) */
  readonly username: string;
  /** Legacy discriminator (e.g., '0001'), '0' for new usernames */
  readonly discriminator: string;
  /** User's avatar hash (null if no custom avatar) */
  readonly avatar: string | null;
  /** Whether the user is a bot account */
  readonly bot?: boolean;
  /** User's display name (null if not set) */
  readonly globalName: string | null;
}

/**
 * Discord guild (server) data from the API.
 *
 * Represents essential fields from a Discord guild object.
 */
export interface DiscordGuild {
  /** Discord snowflake guild ID */
  readonly id: string;
  /** Guild name */
  readonly name: string;
  /** Guild icon hash (null if no custom icon) */
  readonly icon: string | null;
  /** Approximate total member count */
  readonly memberCount?: number;
  /** Discord user ID of the guild owner */
  readonly ownerId: string;
}

/**
 * Constructs a Discord CDN avatar URL from user data.
 *
 * @param user - Discord user object
 * @param size - Image size in pixels (must be power of 2, 16-4096)
 * @returns Full URL to the user's avatar image
 */
export function getAvatarUrl(user: DiscordUser, size: 64 | 128 | 256 | 512 = 128): string {
  if (user.avatar) {
    const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=${size}`;
  }
  // Default avatar based on user ID for new username system
  const index = Number(BigInt(user.id) >> 22n) % 6;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

/**
 * Constructs a Discord CDN guild icon URL.
 *
 * @param guild - Discord guild object
 * @param size - Image size in pixels
 * @returns Full URL to the guild's icon, or null if no icon
 */
export function getGuildIconUrl(guild: DiscordGuild, size: 64 | 128 | 256 | 512 = 128): string | null {
  if (!guild.icon) return null;
  const ext = guild.icon.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}?size=${size}`;
}
