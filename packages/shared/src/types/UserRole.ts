/**
 * User roles within the admin panel and bot system.
 *
 * Defines the permission hierarchy from basic users to full administrators.
 * Used for access control across API, web UI, and bot commands.
 */

/** Available user roles in the system, ordered by privilege level */
export enum UserRole {
  /** Standard Discord server member with no special permissions */
  User = 'user',
  /** Trusted member with limited moderation capabilities */
  Moderator = 'moderator',
  /** Full administrative access to bot configuration and management */
  Admin = 'admin',
}

/** Numeric permission levels mapped to roles (higher = more privilege) */
export const USER_ROLE_LEVELS: Record<UserRole, number> = {
  [UserRole.User]: 0,
  [UserRole.Moderator]: 1,
  [UserRole.Admin]: 2,
} as const;

/**
 * Check if a role has at least the required permission level.
 *
 * @param role - The user's current role
 * @param required - The minimum role required
 * @returns Whether the role meets or exceeds the requirement
 */
export function hasPermission(role: UserRole, required: UserRole): boolean {
  return USER_ROLE_LEVELS[role] >= USER_ROLE_LEVELS[required];
}
