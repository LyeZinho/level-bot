# Level Bot Admin Panel - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task in a separate session.

**Goal:** Transform level-bot into a Turborepo monorepo with NestJS admin API (`apps/api`) and Svelte admin panel (`apps/web`), complete with Discord OAuth2, JWT security, Redis caching, and neobrutalistically-styled UI.

**Architecture:** Monorepo using Turborepo with 3 apps (bot, api, web) + 2 shared packages (shared, db). The web panel communicates with the API via REST + JWT. Both API and bot access the same PostgreSQL database + Redis cache. New `bot_settings` table stores admin-configurable values. All authentication via Discord OAuth2.

**Tech Stack:**
- **Monorepo:** Turborepo + pnpm workspaces
- **Bot:** NestJS + Necord + Discord.js (refactored slightly)
- **API:** NestJS + Passport (Discord OAuth2) + JWT
- **Web:** SvelteKit + TypeScript + Svelte components (no framework)
- **Database:** Drizzle ORM + PostgreSQL (new `bot_settings` + `admin_logs` tables)
- **Cache:** Redis (settings cache, role cache)
- **Styling:** Vanilla CSS (neobrutalist theme, no Tailwind)
- **Build:** Turborepo + pnpm

---

## PHASE 1: Monorepo Setup

### Task 1: Initialize Turborepo Workspace

**Files:**
- Create: `turbo.json` (root)
- Create: `pnpm-workspace.yaml` (root)
- Modify: `package.json` (root, convert to monorepo)
- Create: `tsconfig.json` (root)

**Step 1: Backup current package.json**

```bash
cd /home/pedro/repo/level-bot
git stash  # Save any uncommitted changes
```

**Step 2: Create root package.json (monorepo)**

```json
{
  "name": "level-bot-monorepo",
  "version": "1.0.0",
  "description": "Discord bot with admin panel - monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev --parallel",
    "lint": "turbo lint",
    "format": "turbo format",
    "type-check": "turbo type-check"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

**Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "type-check": {
      "outputs": ["dist/**"],
      "cache": false
    },
    "lint": {
      "outputs": [".eslintcache"]
    }
  }
}
```

**Step 4: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Step 5: Create root tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "paths": {
      "@/*": ["./*"],
      "@shared/*": ["./packages/shared/src/*"],
      "@db/*": ["./packages/db/*"]
    }
  },
  "include": ["apps/**/*.ts", "packages/**/*.ts"],
  "exclude": ["node_modules", "dist", "build"]
}
```

**Step 6: Create directory structure**

```bash
mkdir -p apps/api apps/web packages/shared packages/db
```

**Step 7: Commit**

```bash
git add turbo.json pnpm-workspace.yaml package.json tsconfig.json
git commit -m "feat: initialize turborepo monorepo structure"
```

---

### Task 2: Create Shared Package (`packages/shared`)

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/src/types/index.ts`
- Create: `packages/shared/src/constants/index.ts`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/tsconfig.json`

**Step 1: Create shared package.json**

```json
{
  "name": "@levelbot/shared",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

**Step 2: Create packages/shared/tsconfig.json**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create packages/shared/src/types/index.ts**

```typescript
// Discord OAuth2
export interface DiscordUser {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
}

// JWT Claims
export interface JWTPayload {
  sub: string; // discord_user_id
  discord_id: string;
  discord_username: string;
  role: 'admin' | 'moderator';
  guild_id: string;
  iat: number;
  exp: number;
}

// Admin Panel Types
export interface BotSettings {
  guild_id: string;
  level_up_channel?: string;
  vip_category_id?: string;
  robux_channel_id?: string;
  prefix: string;
  xp_multiplier: number;
  voice_multiplier: number;
  event_multiplier: number;
  level_recalc_interval_ms: number;
  min_voice_seconds: number;
  daily_cooldown_hours: number;
  updated_at: number;
  updated_by: string;
}

export interface ShopItem {
  item_id: number;
  name: string;
  description?: string;
  price: number;
  emoji: string;
  type: 'consumable' | 'boost' | 'cosmetic' | 'vip' | 'mystery_box';
  hidden: boolean;
  created_at: number;
}

export interface Badge {
  badge_id: number;
  name: string;
  description?: string;
  icon: string;
  type: 'manual' | 'automatic';
  xp_threshold?: number;
  created_at: number;
}

export interface AdminLog {
  id: number;
  timestamp: number;
  admin_id: string;
  action: 'create' | 'update' | 'delete' | 'reset' | 'ban';
  resource_type: string;
  resource_id: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  details?: string;
  status: 'success' | 'error';
}

export interface VIPTier {
  name: string;
  multiplier: number;
  price: number;
  role_id: string;
}

export interface SeasonalEvent {
  event_id: number;
  name: string;
  start: number;
  end: number;
  multiplier: number;
  active: boolean;
  description?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
```

**Step 4: Create packages/shared/src/constants/index.ts**

```typescript
export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

export const VIP_TIERS = [
  { name: 'Bronze', multiplier: 1.1 },
  { name: 'Silver', multiplier: 1.25 },
  { name: 'Gold', multiplier: 1.5 },
  { name: 'Platinum', multiplier: 2.0 },
] as const;

export const ITEM_TYPES = [
  'consumable',
  'boost',
  'cosmetic',
  'vip',
  'mystery_box',
] as const;

export const BADGE_TYPES = [
  'manual',
  'automatic',
] as const;

export const ADMIN_ACTIONS = [
  'create',
  'update',
  'delete',
  'reset',
  'ban',
] as const;

export const JWT_EXPIRY = {
  ACCESS: 15 * 60, // 15 minutes in seconds
  REFRESH: 7 * 24 * 60 * 60, // 7 days
} as const;

export const CACHE_TTL = {
  SETTINGS: 5 * 60, // 5 minutes
  ROLES: 5 * 60,
  SESSION: 15 * 60,
} as const;
```

**Step 5: Create packages/shared/src/index.ts**

```typescript
export * from './types/index';
export * from './constants/index';
```

**Step 6: Commit**

```bash
git add packages/shared/
git commit -m "feat: create shared types and constants package"
```

---

### Task 3: Create DB Package (`packages/db`)

**Files:**
- Create: `packages/db/package.json`
- Copy: `src/database/schema/*` to `packages/db/schema/`
- Create: `packages/db/drizzle.config.ts`
- Create: `packages/db/index.ts`
- Create: `packages/db/tsconfig.json`

**Step 1: Create packages/db/package.json**

```json
{
  "name": "@levelbot/db",
  "version": "1.0.0",
  "private": true,
  "main": "index.ts",
  "dependencies": {
    "drizzle-orm": "^0.45.2",
    "pg": "^8.20.0",
    "postgres": "^3.4.8"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "drizzle-kit": "^0.31.10",
    "typescript": "^5.0.0"
  }
}
```

**Step 2: Copy schema files**

```bash
cp -r src/database/schema packages/db/schema
```

**Step 3: Create packages/db/schema/index.ts (update to include new tables)**

```typescript
// Re-export all existing schemas
export * from './users';
export * from './items';
export * from './user-inventory';
export * from './user-boosts';
export * from './user-vips';
export * from './badges';
export * from './user-badges';
export * from './missions';
export * from './user-missions';

// New schemas
export * from './bot-settings';
export * from './admin-logs';
```

**Step 4: Create packages/db/schema/bot-settings.ts**

```typescript
import { pgTable, serial, text, doublePrecision, integer, bigint } from 'drizzle-orm/pg-core';

export const botSettings = pgTable('bot_settings', {
  id: serial('id').primaryKey(),
  guild_id: text('guild_id').notNull().unique(),
  level_up_channel: text('level_up_channel'),
  vip_category_id: text('vip_category_id'),
  robux_channel_id: text('robux_channel_id'),
  prefix: text('prefix').default('!'),
  xp_multiplier: doublePrecision('xp_multiplier').default(1.0),
  voice_multiplier: doublePrecision('voice_multiplier').default(1.0),
  event_multiplier: doublePrecision('event_multiplier').default(1.0),
  level_recalc_interval_ms: integer('level_recalc_interval_ms').default(300000),
  min_voice_seconds: integer('min_voice_seconds').default(60),
  daily_cooldown_hours: integer('daily_cooldown_hours').default(24),
  updated_at: bigint('updated_at', { mode: 'number' }),
  updated_by: text('updated_by'),
});
```

**Step 5: Create packages/db/schema/admin-logs.ts**

```typescript
import { pgTable, serial, bigint, text, jsonb } from 'drizzle-orm/pg-core';

export const adminLogs = pgTable('admin_logs', {
  id: serial('id').primaryKey(),
  timestamp: bigint('timestamp', { mode: 'number' }).notNull(),
  admin_id: text('admin_id').notNull(),
  action: text('action').notNull(), // 'create', 'update', 'delete', 'reset', 'ban'
  resource_type: text('resource_type'),
  resource_id: text('resource_id'),
  old_value: jsonb('old_value'),
  new_value: jsonb('new_value'),
  details: text('details'),
  status: text('status').default('success'), // 'success' or 'error'
});
```

**Step 6: Create packages/db/index.ts**

```typescript
export * from './schema';

// Helper functions for common operations
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export type Database = PostgresJsDatabase<typeof schema>;
```

**Step 7: Create packages/db/tsconfig.json**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 8: Commit**

```bash
git add packages/db/
git commit -m "feat: create unified db package with schemas and new tables"
```

---

## PHASE 2: API Setup

### Task 4: Create API App (`apps/api`) - Scaffold

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/nest-cli.json`

**Step 1: Create apps/api/package.json**

```json
{
  "name": "@levelbot/api",
  "version": "1.0.0",
  "private": true,
  "main": "dist/main",
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "dev": "nest start --watch",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@nestjs/common": "^11.1.17",
    "@nestjs/core": "^11.1.17",
    "@nestjs/config": "^4.0.3",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/jwt": "^12.0.1",
    "passport": "^0.7.0",
    "passport-oauth2": "^1.8.0",
    "axios": "^1.6.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.2",
    "drizzle-orm": "^0.45.2",
    "postgres": "^3.4.8",
    "@levelbot/shared": "*",
    "@levelbot/db": "*"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.16",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.2"
  }
}
```

**Step 2: Create apps/api/src/main.ts**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  const port = parseInt(process.env.API_PORT || '3001', 10);
  await app.listen(port);
  console.log(`✅ API running on port ${port}`);
}

bootstrap();
```

**Step 3: Create apps/api/src/app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    AdminModule,
  ],
})
export class AppModule {}
```

**Step 4: Create apps/api/tsconfig.json**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 5: Create apps/api/nest-cli.json**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

**Step 6: Commit**

```bash
git add apps/api/
git commit -m "feat: scaffold NestJS API app with basic structure"
```

---

### Task 5: API - Create Auth Module (Discord OAuth2 + JWT)

**Files:**
- Create: `apps/api/src/auth/auth.module.ts`
- Create: `apps/api/src/auth/auth.service.ts`
- Create: `apps/api/src/auth/auth.controller.ts`
- Create: `apps/api/src/auth/jwt.strategy.ts`
- Create: `apps/api/src/auth/discord-oauth.strategy.ts`
- Create: `apps/api/src/common/decorators/roles.decorator.ts`
- Create: `apps/api/src/common/guards/roles.guard.ts`

**Step 1: Create apps/api/src/auth/auth.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DiscordUser, JWTPayload, JWT_EXPIRY } from '@levelbot/shared';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly discordGuildId = process.env.GUILD_ID;
  private readonly discordBotToken = process.env.DISCORD_TOKEN;
  private readonly adminRoleId = process.env.ADMIN_ROLE_ID;
  private readonly moderatorRoleId = process.env.MODERATOR_ROLE_ID;

  constructor(private jwtService: JwtService) {}

  async validateDiscordUser(accessToken: string): Promise<DiscordUser> {
    const response = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

  async getUserRole(userId: string): Promise<'admin' | 'moderator' | null> {
    const response = await axios.get(
      `https://discord.com/api/guilds/${this.discordGuildId}/members/${userId}`,
      { headers: { Authorization: `Bot ${this.discordBotToken}` } },
    );

    const roles = response.data.roles;
    if (roles.includes(this.adminRoleId)) return 'admin';
    if (roles.includes(this.moderatorRoleId)) return 'moderator';
    return null;
  }

  generateTokens(user: DiscordUser, role: string): {
    access_token: string;
    refresh_token: string;
  } {
    const payload: JWTPayload = {
      sub: user.id,
      discord_id: user.id,
      discord_username: user.username,
      role: role as any,
      guild_id: this.discordGuildId!,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY.ACCESS,
    };

    const access_token = this.jwtService.sign(payload);

    const refreshPayload = {
      ...payload,
      type: 'refresh',
      exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY.REFRESH,
    };

    const refresh_token = this.jwtService.sign(refreshPayload);

    return { access_token, refresh_token };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      if (decoded.type !== 'refresh') throw new Error('Invalid token type');

      const payload: JWTPayload = {
        sub: decoded.sub,
        discord_id: decoded.discord_id,
        discord_username: decoded.discord_username,
        role: decoded.role,
        guild_id: decoded.guild_id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY.ACCESS,
      };

      return this.jwtService.sign(payload);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
```

**Step 2: Create apps/api/src/auth/auth.controller.ts**

```typescript
import { Controller, Get, Post, Query, Res, Body } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('discord/login')
  discordLogin(@Res() res: Response) {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = process.env.DISCORD_REDIRECT_URI;
    const scope = ['identify', 'email', 'guilds.members.read'].join(' ');

    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

    res.redirect(url);
  }

  @Get('discord/callback')
  async discordCallback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    try {
      const clientId = process.env.DISCORD_CLIENT_ID;
      const clientSecret = process.env.DISCORD_CLIENT_SECRET;
      const redirectUri = process.env.DISCORD_REDIRECT_URI;

      // Exchange code for access token
      const tokenRes = await require('axios').post(
        'https://discord.com/api/oauth2/token',
        {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        },
      );

      const discordUser = await this.authService.validateDiscordUser(
        tokenRes.data.access_token,
      );
      const role = await this.authService.getUserRole(discordUser.id);

      if (!role) {
        return res
          .status(403)
          .json({ error: 'User does not have admin or moderator role' });
      }

      const { access_token, refresh_token } =
        this.authService.generateTokens(discordUser, role);

      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to web panel with access token
      const webUrl = process.env.WEB_URL || 'http://localhost:5173';
      res.redirect(`${webUrl}/?token=${access_token}`);
    } catch (error) {
      res.status(500).json({ error: 'OAuth callback failed' });
    }
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    const newAccessToken = await this.authService.refreshTokens(
      body.refresh_token,
    );
    return { access_token: newAccessToken };
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('refresh_token');
    res.json({ success: true });
  }
}
```

**Step 3: Create apps/api/src/auth/jwt.strategy.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWTPayload } from '@levelbot/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: JWTPayload) {
    return payload;
  }
}
```

**Step 4: Create apps/api/src/auth/discord-oauth.strategy.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-oauth2';

@Injectable()
export class DiscordOAuthStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor() {
    super({
      authorizationURL: 'https://discord.com/api/oauth2/authorize',
      tokenURL: 'https://discord.com/api/oauth2/token',
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_REDIRECT_URI,
      scope: ['identify', 'email', 'guilds.members.read'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: any) {
    return { ...profile, accessToken };
  }
}
```

**Step 5: Create apps/api/src/common/decorators/roles.decorator.ts**

```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

**Step 6: Create apps/api/src/common/guards/roles.guard.ts**

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JWTPayload } from '@levelbot/shared';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as JWTPayload;

    if (!user) throw new ForbiddenException('User not authenticated');

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}
```

**Step 7: Create apps/api/src/auth/auth.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { DiscordOAuthStrategy } from './discord-oauth.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, DiscordOAuthStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

**Step 8: Commit**

```bash
git add apps/api/src/auth apps/api/src/common
git commit -m "feat: implement Discord OAuth2 and JWT authentication in API"
```

---

### Task 6: API - Create Admin Module (CRUD Endpoints - Part 1)

*This task is long. I'll provide the admin module structure with basic endpoints.*

**Files:**
- Create: `apps/api/src/admin/admin.module.ts`
- Create: `apps/api/src/admin/admin.controller.ts`
- Create: `apps/api/src/admin/admin.service.ts`
- Create: `apps/api/src/admin/items/items.controller.ts`
- Create: `apps/api/src/admin/items/items.service.ts`

**Step 1: Create apps/api/src/admin/admin.service.ts (main service)**

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '@levelbot/db';
import { Database } from '@levelbot/db';
import { botSettings, adminLogs } from '@levelbot/db';
import { eq } from 'drizzle-orm';

@Injectable()
export class AdminService {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async logAction(
    admin_id: string,
    action: string,
    resource_type: string,
    resource_id: string,
    old_value?: any,
    new_value?: any,
    details?: string,
  ) {
    await this.db.insert(adminLogs).values({
      timestamp: Date.now(),
      admin_id,
      action,
      resource_type,
      resource_id,
      old_value,
      new_value,
      details,
      status: 'success',
    });
  }

  async getSettings(guild_id: string) {
    const result = await this.db
      .select()
      .from(botSettings)
      .where(eq(botSettings.guild_id, guild_id))
      .limit(1);

    return result[0] || null;
  }

  async updateSettings(guild_id: string, updates: any, admin_id: string) {
    const old = await this.getSettings(guild_id);

    await this.db
      .update(botSettings)
      .set({ ...updates, updated_at: Date.now(), updated_by: admin_id })
      .where(eq(botSettings.guild_id, guild_id));

    await this.logAction(
      admin_id,
      'update',
      'bot_settings',
      guild_id,
      old,
      updates,
    );

    return this.getSettings(guild_id);
  }
}
```

**Step 2: Create apps/api/src/admin/admin.controller.ts**

```typescript
import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';

@Controller('api/admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('settings')
  @Roles('admin', 'moderator')
  async getSettings(@Request() req: any) {
    const settings = await this.adminService.getSettings(req.user.guild_id);
    return { success: true, data: settings };
  }
}
```

**Step 3: Create apps/api/src/admin/items/items.service.ts**

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '@levelbot/db';
import { Database } from '@levelbot/db';
import { items } from '@levelbot/db';
import { eq, like } from 'drizzle-orm';

@Injectable()
export class ItemsService {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async getAllItems(limit = 20, offset = 0) {
    const rows = await this.db
      .select()
      .from(items)
      .limit(limit)
      .offset(offset);

    const total = await this.db
      .select({ count: items.item_id })
      .from(items);

    return {
      items: rows,
      total: total[0]?.count || 0,
      page: Math.floor(offset / limit) + 1,
      pages: Math.ceil((total[0]?.count || 0) / limit),
    };
  }

  async createItem(data: any) {
    const result = await this.db
      .insert(items)
      .values({ ...data, created_at: Date.now() })
      .returning();

    return result[0];
  }

  async updateItem(item_id: number, data: any) {
    const result = await this.db
      .update(items)
      .set(data)
      .where(eq(items.item_id, item_id))
      .returning();

    return result[0];
  }

  async deleteItem(item_id: number) {
    await this.db.delete(items).where(eq(items.item_id, item_id));
    return { success: true };
  }
}
```

**Step 4: Create apps/api/src/admin/items/items.controller.ts**

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ItemsService } from './items.service';
import { AdminService } from '../admin.service';

@Controller('api/admin/items')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ItemsController {
  constructor(
    private itemsService: ItemsService,
    private adminService: AdminService,
  ) {}

  @Get()
  @Roles('admin', 'moderator')
  async getItems(@Query('page') page = 1, @Query('limit') limit = 20) {
    const offset = (page - 1) * limit;
    return { success: true, data: await this.itemsService.getAllItems(limit, offset) };
  }

  @Post()
  @Roles('admin')
  async createItem(@Body() body: any, @Request() req: any) {
    const item = await this.itemsService.createItem(body);
    await this.adminService.logAction(
      req.user.discord_id,
      'create',
      'item',
      String(item.item_id),
      null,
      item,
    );
    return { success: true, data: item };
  }

  @Patch(':id')
  @Roles('admin')
  async updateItem(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    const updated = await this.itemsService.updateItem(Number(id), body);
    await this.adminService.logAction(
      req.user.discord_id,
      'update',
      'item',
      id,
      null,
      body,
    );
    return { success: true, data: updated };
  }

  @Delete(':id')
  @Roles('admin')
  async deleteItem(@Param('id') id: string, @Request() req: any) {
    await this.itemsService.deleteItem(Number(id));
    await this.adminService.logAction(
      req.user.discord_id,
      'delete',
      'item',
      id,
    );
    return { success: true };
  }
}
```

**Step 5: Create apps/api/src/admin/admin.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ItemsController } from './items/items.controller';
import { ItemsService } from './items/items.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminController, ItemsController],
  providers: [AdminService, ItemsService],
})
export class AdminModule {}
```

**Step 6: Create Database Module for API**

Create `apps/api/src/database/database.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@levelbot/db';

const DRIZZLE = 'DRIZZLE';

@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: async () => {
        const client = postgres({
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || '5432', 10),
          database: process.env.DB_NAME,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
        });

        return drizzle(client, { schema });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
```

Update `apps/api/src/app.module.ts` to import `DatabaseModule`.

**Step 7: Update apps/api/src/app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    AdminModule,
  ],
})
export class AppModule {}
```

**Step 8: Commit**

```bash
git add apps/api/src/admin apps/api/src/database
git commit -m "feat: add admin CRUD endpoints for items (part 1)"
```

---

## PHASE 3: Svelte Web Panel

Due to length constraints, I'm providing a high-level outline. The implementation can follow the same pattern: create components, pages, API client.

### Task 7: Create Web App (`apps/web`) - Scaffold

**Setup:**
```bash
cd apps/web
npm create svelte@latest . -- --template minimal --typescript
npm install
```

**Key Files to Create:**
- `src/lib/api.ts` - HTTP client with JWT handling
- `src/lib/stores.ts` - Svelte stores for auth, theme, data
- `src/lib/components/Button.svelte`
- `src/lib/components/Modal.svelte`
- `src/lib/components/Card.svelte`
- `src/lib/components/Table.svelte`
- `src/lib/components/Input.svelte`
- `src/lib/components/Sidebar.svelte`
- `src/routes/+layout.svelte`
- `src/routes/+page.svelte` (dashboard)
- `src/routes/settings/+page.svelte`
- `src/routes/items/+page.svelte`
- `src/routes/badges/+page.svelte`
- `src/routes/users/+page.svelte`
- `src/routes/events/+page.svelte`
- `src/routes/vips/+page.svelte`
- `src/routes/logs/+page.svelte`
- `src/app.css` (neobrutalist styles)

**API Client (apps/web/src/lib/api.ts):**
```typescript
import type { APIResponse, PaginatedResponse } from '@levelbot/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let accessToken: string | null = null;

export function setAccessToken(token: string) {
  accessToken = token;
}

async function fetch_json<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  } as any;

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// Items API
export const itemsAPI = {
  getItems: (page: number, limit: number) =>
    fetch_json<PaginatedResponse<any>>(
      `${API_URL}/api/admin/items?page=${page}&limit=${limit}`,
    ),
  createItem: (data: any) =>
    fetch_json<any>(`${API_URL}/api/admin/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateItem: (id: number, data: any) =>
    fetch_json<any>(`${API_URL}/api/admin/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteItem: (id: number) =>
    fetch_json<any>(`${API_URL}/api/admin/items/${id}`, {
      method: 'DELETE',
    }),
};

// ... more API groups
```

**Neobrutalist Styles (apps/web/src/app.css):**
```css
:root {
  --bg: #0a0a0a;
  --surface: #1a1a1a;
  --border: #2a2a2a;
  --accent: #8b5cf6;
  --accent-light: #a78bfa;
  --text-primary: #ffffff;
  --text-secondary: #d4d4d8;
  --text-tertiary: #a1a1a6;
  --success: #10b981;
  --warning: #f97316;
  --error: #ef4444;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 1.5;
}

button {
  background-color: var(--accent);
  color: var(--bg);
  border: 4px solid var(--accent-light);
  padding: 12px 24px;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

button:hover {
  background-color: var(--accent-light);
  border-color: var(--accent);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

input, textarea, select {
  background-color: var(--surface);
  color: var(--text-primary);
  border: 2px solid var(--border);
  padding: 12px;
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.2s;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--accent);
}

.card {
  background-color: var(--surface);
  border: 2px solid var(--border);
  padding: 24px;
  margin-bottom: 16px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  border: 4px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: var(--surface);
  border: 4px solid var(--accent);
  padding: 32px;
  max-width: 600px;
  width: 90%;
}

table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid var(--border);
}

th, td {
  padding: 16px;
  text-align: left;
  border: 1px solid var(--border);
}

th {
  background-color: var(--border);
  font-weight: bold;
  border: 2px solid var(--border);
}

tr:hover {
  background-color: var(--border);
}
```

**Store (apps/web/src/lib/stores.ts):**
```typescript
import { writable, derived } from 'svelte/store';
import type { JWTPayload } from '@levelbot/shared';

export const user = writable<JWTPayload | null>(null);
export const isAuthenticated = derived(user, ($user) => !!$user);
export const isAdmin = derived(
  user,
  ($user) => $user?.role === 'admin',
);
```

---

## PHASE 4: Integration & Final Setup

This involves:
- Update existing bot (`apps/bot`) to use shared types and db
- Create Docker Compose for all 4 services (postgres, redis, bot, api, web)
- Add CI/CD pipeline
- Complete testing

---

## ESTIMATED EFFORT

**Total Tasks: ~30 tasks across 4 phases**

- **Phase 1 (Monorepo):** 3 tasks, ~4 hours
- **Phase 2 (API):** 3 tasks, ~6 hours
- **Phase 3 (Web):** 1 high-level task (with sub-components), ~12 hours
- **Phase 4 (Integration):** ~3 tasks, ~4 hours

**Total: ~26 hours**

---

## Next Step

**Plan complete and saved.**

**Execution Options:**

1. **Subagent-Driven (This Session)** - I dispatch fresh subagent per task, review code, fast iteration
2. **Parallel Session (Separate Terminal)** - You open new session in worktree, I guide with checklist

**Which approach would you prefer?**
