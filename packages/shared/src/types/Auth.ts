/**
 * Authentication types for Discord OAuth2 and JWT-based sessions.
 *
 * Covers the full auth flow: Discord OAuth2 exchange,
 * JWT token generation, and session management.
 */

import { UserRole } from './UserRole.js';

/**
 * Payload encoded within JWT access tokens.
 *
 * Contains the minimum data needed for authorization
 * decisions without a database lookup.
 */
export interface JWTPayload {
  /** JWT subject: Discord user ID */
  readonly sub: string;
  /** Discord guild ID the token is scoped to */
  readonly guildId: string;
  /** User's role for permission checks */
  readonly role: UserRole;
  /** JWT issued-at timestamp (Unix seconds) */
  readonly iat: number;
  /** JWT expiration timestamp (Unix seconds) */
  readonly exp: number;
  /** JWT unique identifier for token revocation */
  readonly jti: string;
}

/**
 * A pair of access and refresh tokens.
 *
 * Returned after successful authentication.
 * Access token is short-lived; refresh token is long-lived.
 */
export interface TokenPair {
  /** Short-lived JWT for API authorization */
  readonly accessToken: string;
  /** Long-lived token for obtaining new access tokens */
  readonly refreshToken: string;
  /** Access token expiration in seconds from issuance */
  readonly expiresIn: number;
  /** Token type (always 'Bearer') */
  readonly tokenType: 'Bearer';
}

/**
 * Discord OAuth2 user data from the identify scope.
 *
 * Returned by Discord's /users/@me endpoint after
 * completing the OAuth2 authorization code flow.
 */
export interface DiscordOAuth2User {
  /** Discord snowflake user ID */
  readonly id: string;
  /** Username */
  readonly username: string;
  /** Legacy discriminator */
  readonly discriminator: string;
  /** Avatar hash */
  readonly avatar: string | null;
  /** Email address (requires 'email' scope) */
  readonly email?: string;
  /** Whether the email is verified */
  readonly verified?: boolean;
  /** Display name */
  readonly global_name: string | null;
}

/**
 * Discord OAuth2 token response.
 *
 * Returned by Discord's /oauth2/token endpoint.
 */
export interface DiscordOAuth2TokenResponse {
  /** OAuth2 access token */
  readonly access_token: string;
  /** Token type (usually 'Bearer') */
  readonly token_type: string;
  /** Token expiration in seconds */
  readonly expires_in: number;
  /** Refresh token for obtaining new access tokens */
  readonly refresh_token: string;
  /** Granted OAuth2 scopes */
  readonly scope: string;
}
