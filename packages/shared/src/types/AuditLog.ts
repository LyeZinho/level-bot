/**
 * Audit log types for tracking administrative actions.
 *
 * Every mutation performed through the admin panel is logged
 * for accountability and debugging purposes.
 */

/** Categories of auditable administrative actions */
export enum AuditAction {
  /** Bot settings were modified */
  SettingsUpdate = 'settings.update',

  /** Shop item CRUD operations */
  ShopItemCreate = 'shop.item.create',
  ShopItemUpdate = 'shop.item.update',
  ShopItemDelete = 'shop.item.delete',

  /** Badge CRUD operations */
  BadgeCreate = 'badge.create',
  BadgeUpdate = 'badge.update',
  BadgeDelete = 'badge.delete',
  BadgeGrant = 'badge.grant',
  BadgeRevoke = 'badge.revoke',

  /** VIP management operations */
  VIPGrant = 'vip.grant',
  VIPRevoke = 'vip.revoke',
  VIPUpdate = 'vip.update',

  /** Seasonal event operations */
  EventCreate = 'event.create',
  EventUpdate = 'event.update',
  EventDelete = 'event.delete',

  /** User management operations */
  UserBan = 'user.ban',
  UserUnban = 'user.unban',
  UserCoinsAdjust = 'user.coins.adjust',
  UserXPAdjust = 'user.xp.adjust',
  UserRoleChange = 'user.role.change',

  /** Admin session events */
  AdminLogin = 'admin.login',
  AdminLogout = 'admin.logout',
}

/**
 * A single audit log entry.
 *
 * Records who performed what action, when, and the before/after
 * state of any modified data.
 */
export interface AuditLog {
  /** Unique identifier for this log entry */
  readonly id: string;
  /** The action that was performed */
  readonly action: AuditAction;
  /** Discord user ID of the admin who performed the action */
  readonly performedBy: string;
  /** Discord guild ID where the action was performed */
  readonly guildId: string;
  /** Identifier of the entity that was affected (e.g., user ID, item ID) */
  readonly targetId: string | null;
  /** Human-readable description of the target (e.g., username, item name) */
  readonly targetLabel: string | null;
  /** State of the entity before the change (JSON-serialized) */
  readonly before: Record<string, unknown> | null;
  /** State of the entity after the change (JSON-serialized) */
  readonly after: Record<string, unknown> | null;
  /** IP address of the request origin */
  readonly ipAddress: string | null;
  /** User agent string of the request */
  readonly userAgent: string | null;
  /** ISO 8601 timestamp when the action was performed */
  readonly timestamp: string;
}

/** Fields required to create a new audit log entry */
export interface AuditLogCreate {
  readonly action: AuditAction;
  readonly performedBy: string;
  readonly guildId: string;
  readonly targetId?: string;
  readonly targetLabel?: string;
  readonly before?: Record<string, unknown>;
  readonly after?: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}
