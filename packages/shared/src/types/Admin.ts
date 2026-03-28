/**
 * Admin panel user and session types.
 *
 * Represents authenticated administrators and their
 * active sessions within the admin panel.
 */

import { UserRole } from './UserRole.js';

/**
 * An authenticated admin panel user.
 *
 * Combines Discord identity with admin-specific
 * permissions and metadata.
 */
export interface AdminUser {
  /** Discord snowflake user ID (primary key) */
  readonly id: string;
  /** Discord username */
  readonly username: string;
  /** Discord display name */
  readonly globalName: string | null;
  /** Discord avatar hash */
  readonly avatar: string | null;
  /** Admin role determining permissions */
  readonly role: UserRole;
  /** Discord guild ID the admin is authorized for */
  readonly guildId: string;
  /** ISO 8601 timestamp of the last successful login */
  readonly lastLoginAt: string | null;
  /** ISO 8601 timestamp when the admin record was created */
  readonly createdAt: string;
}

/**
 * An active admin panel session.
 *
 * Tracks login sessions for security auditing
 * and concurrent session management.
 */
export interface AdminSession {
  /** Unique session identifier */
  readonly id: string;
  /** Discord user ID of the session owner */
  readonly userId: string;
  /** Discord guild ID the session is scoped to */
  readonly guildId: string;
  /** IP address from which the session was initiated */
  readonly ipAddress: string;
  /** User agent of the client that initiated the session */
  readonly userAgent: string;
  /** ISO 8601 timestamp when the session was created */
  readonly createdAt: string;
  /** ISO 8601 timestamp when the session expires */
  readonly expiresAt: string;
  /** Whether the session has been explicitly revoked */
  readonly revoked: boolean;
}

/**
 * Public-safe admin user data for API responses.
 *
 * Omits sensitive session data while keeping
 * identity and role information.
 */
export interface AdminUserPublic {
  /** Discord user ID */
  readonly id: string;
  /** Discord username */
  readonly username: string;
  /** Discord display name */
  readonly globalName: string | null;
  /** Discord avatar hash */
  readonly avatar: string | null;
  /** Admin role */
  readonly role: UserRole;
}
