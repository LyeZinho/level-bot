import { UserRole } from '../types/UserRole.js';

export const ROLE_HIERARCHY: readonly UserRole[] = [
  UserRole.User,
  UserRole.Moderator,
  UserRole.Admin,
] as const;

export const ROLE_PERMISSIONS = {
  [UserRole.User]: [
    'view:own_profile',
    'view:leaderboard',
    'view:shop',
  ],
  [UserRole.Moderator]: [
    'view:own_profile',
    'view:leaderboard',
    'view:shop',
    'view:users',
    'manage:users',
    'manage:shop',
    'manage:badges',
    'view:audit_logs',
  ],
  [UserRole.Admin]: [
    'view:own_profile',
    'view:leaderboard',
    'view:shop',
    'view:users',
    'manage:users',
    'manage:shop',
    'manage:badges',
    'view:audit_logs',
    'manage:settings',
    'manage:events',
    'manage:vip',
    'manage:admins',
    'manage:roles',
  ],
} as const satisfies Record<UserRole, readonly string[]>;

export type Permission = (typeof ROLE_PERMISSIONS)[UserRole][number];

export function getPermissionsForRole(role: UserRole): readonly string[] {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(role: UserRole, permission: string): boolean {
  return (ROLE_PERMISSIONS[role] as readonly string[]).includes(permission);
}
