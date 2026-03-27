# NestJS Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the Discord level/economy bot from plain Node.js to NestJS + Necord + Drizzle ORM + PostgreSQL + Redis, preserving existing DB schema exactly, and adding 5 new features.

**Architecture:** NestJS application using Necord for Discord.js integration, Drizzle ORM with `drizzle-kit pull` for type-safe DB access without migrations, Redis for caching/cooldowns, and @nestjs/schedule for cron jobs. Each domain (leveling, economy, vip, badges) is a separate NestJS module.

**Tech Stack:** NestJS 11, Necord 7, discord.js 14, Drizzle ORM 0.39, PostgreSQL 16, Redis 7, Sharp, TypeScript 5.5

**Design doc:** `docs/plans/2026-03-27-nestjs-migration-design.md`

---

## Phase 1: Project Scaffold & Core Infrastructure

### Task 1: Initialize NestJS project

**Files:**
- Create: `tsconfig.json`
- Create: `tsconfig.build.json`
- Create: `nest-cli.json`
- Modify: `package.json`
- Create: `src/main.ts`
- Create: `src/app.module.ts`

**Step 1: Install NestJS dependencies**

```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config reflect-metadata rxjs joi
npm install -D @nestjs/cli typescript @types/node ts-node tsconfig-paths
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**Step 3: Create tsconfig.build.json**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

**Step 4: Create nest-cli.json**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": [
      { "include": "media/**/*", "watchAssets": true },
      { "include": "**/*.json", "watchAssets": true }
    ]
  }
}
```

**Step 5: Create src/main.ts**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Graceful shutdown
  const signals = ['SIGTERM', 'SIGINT'];
  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`Received ${signal}, shutting down...`);
      await app.close();
      process.exit(0);
    });
  }

  console.log('🤖 Bot is running!');
}

bootstrap();
```

**Step 6: Create src/app.module.ts (minimal)**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

**Step 7: Update package.json scripts**

Add to scripts:
```json
{
  "build": "nest build",
  "start:dev": "nest start --watch",
  "start:prod": "node dist/main.js"
}
```

**Step 8: Verify it compiles**

```bash
npx nest build
```
Expected: Build succeeds, `dist/` created.

**Step 9: Commit**

```bash
git add -A && git commit -m "feat: initialize NestJS project scaffold"
```

---

### Task 2: Config module with env validation

**Files:**
- Create: `src/config/env.validation.ts`
- Modify: `src/app.module.ts`

**Step 1: Create env validation schema**

```typescript
// src/config/env.validation.ts
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Discord
  DISCORD_TOKEN: Joi.string().required(),
  CLIENT_ID: Joi.string().required(),
  GUILD_ID: Joi.string().required(),
  PREFIX: Joi.string().default('!'),

  // PostgreSQL
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(11900),
  DB_NAME: Joi.string().default('levelbot'),
  DB_USER: Joi.string().default('levelbot'),
  DB_PASSWORD: Joi.string().default('levelbot123'),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  // Bot Config
  LEVEL_RECALC_INTERVAL_MS: Joi.number().default(300000),
  MIN_VOICE_SECONDS: Joi.number().default(60),
  VIP_CATEGORY_ID: Joi.string().default('1067725669150240818'),
  ALLOWED_GUILDS: Joi.string().default('832509216895926314,963393023486590978'),

  // Channels
  LEVEL_UP_CHANNEL_ID: Joi.string().default('1449807035389579407'),
  ROBUX_REDEMPTION_CHANNEL_ID: Joi.string().default('1454206289029759138'),
});
```

**Step 2: Update app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
  ],
})
export class AppModule {}
```

**Step 3: Verify build**

```bash
npx nest build
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add config module with env validation"
```

---

### Task 3: Database module with Drizzle ORM

**Files:**
- Create: `src/database/database.module.ts`
- Create: `src/database/drizzle.provider.ts`
- Create: `src/database/schema/users.ts`
- Create: `src/database/schema/items.ts`
- Create: `src/database/schema/user-inventory.ts`
- Create: `src/database/schema/user-boosts.ts`
- Create: `src/database/schema/user-vips.ts`
- Create: `src/database/schema/badges.ts`
- Create: `src/database/schema/user-badges.ts`
- Create: `src/database/schema/missions.ts`
- Create: `src/database/schema/user-missions.ts`
- Create: `src/database/schema/index.ts`
- Create: `drizzle.config.ts`

**Step 1: Install Drizzle dependencies**

```bash
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg
```

**Step 2: Create drizzle.config.ts (for `drizzle-kit pull`)**

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  out: './src/database/schema-generated',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 11900,
    user: process.env.DB_USER || 'levelbot',
    password: process.env.DB_PASSWORD || 'levelbot123',
    database: process.env.DB_NAME || 'levelbot',
  },
});
```

**Step 3: Create all 9 schema files**

Create each schema file matching the exact DB structure from `database.js` and `migrate-badges.js`. See design doc Section 2 for exact column definitions.

Key files (all in `src/database/schema/`):
- `users.ts` — PK(user_id, guild_id), all columns matching `database.js` lines 25-37
- `items.ts` — PK(item_id SERIAL), columns matching lines 43-52
- `user-inventory.ts` — PK(user_id, guild_id, item_id), FK to items
- `user-boosts.ts` — PK(user_id, guild_id, boost_type), FLOAT multiplier
- `user-vips.ts` — PK(user_id, guild_id, tier), INTEGER multiplier, active BOOL
- `badges.ts` — PK(badge_id SERIAL), VARCHAR columns matching `migrate-badges.js`
- `user-badges.ts` — PK(id SERIAL), UNIQUE(user_id, guild_id, badge_id), FK CASCADE
- `missions.ts` — PK(mission_id SERIAL), FK to badges ON DELETE SET NULL
- `user-missions.ts` — PK(id SERIAL), UNIQUE(user_id, guild_id, mission_id), FK CASCADE
- `index.ts` — re-exports all schemas

**Step 4: Create Drizzle provider**

```typescript
// src/database/drizzle.provider.ts
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE');

export type DrizzleDB = NodePgDatabase<typeof schema>;

export const DrizzleProvider: Provider = {
  provide: DRIZZLE,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const pool = new Pool({
      host: config.get('DB_HOST'),
      port: config.get('DB_PORT'),
      database: config.get('DB_NAME'),
      user: config.get('DB_USER'),
      password: config.get('DB_PASSWORD'),
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    return drizzle(pool, { schema });
  },
};
```

**Step 5: Create database module**

```typescript
// src/database/database.module.ts
import { Global, Module } from '@nestjs/common';
import { DrizzleProvider } from './drizzle.provider';

@Global()
@Module({
  providers: [DrizzleProvider],
  exports: [DrizzleProvider],
})
export class DatabaseModule {}
```

**Step 6: Import DatabaseModule in AppModule**

**Step 7: Verify build**

```bash
npx nest build
```

**Step 8: Commit**

```bash
git add -A && git commit -m "feat: add Drizzle ORM database module with all 9 table schemas"
```

---

### Task 4: Cache module with Redis

**Files:**
- Create: `src/cache/cache.module.ts`
- Create: `src/cache/cache.service.ts`

**Step 1: Install Redis dependencies**

```bash
npm install cache-manager cache-manager-redis-yet
```

**Step 2: Create cache service**

```typescript
// src/cache/cache.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.cache.set(key, value, ttlSeconds * 1000);
  }

  async del(key: string): Promise<void> {
    await this.cache.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const val = await this.cache.get(key);
    return val !== undefined && val !== null;
  }
}
```

**Step 3: Create cache module**

```typescript
// src/cache/cache.module.ts
import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: config.get('REDIS_HOST'),
            port: config.get('REDIS_PORT'),
          },
        }),
      }),
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheAppModule {}
```

**Step 4: Import in AppModule**

**Step 5: Verify build**

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add Redis cache module with CacheService wrapper"
```

---

## Phase 2: Domain Services (Business Logic)

### Task 5: Leveling service

**Files:**
- Create: `src/leveling/leveling.module.ts`
- Create: `src/leveling/leveling.service.ts`
- Create: `src/leveling/xp.constants.ts`

Port all leveling logic from `database.js`:
- `calculateLevel(xp)` — `Math.floor(Math.sqrt(xp / 100)) + 1`
- `getXPForLevel(level)` — `Math.pow(level - 1, 2) * 100`
- `getXPProgress(xp)` — current/needed/percentage
- `addXp(userId, guildId, username, xpGain)` — with multiplier support, returns `{ leveledUp, newLevel, xpGained, coinsGained, multiplier }`
- `addVoiceTime(userId, guildId, username, seconds)` — 1 XP per minute of voice, with multiplier
- `getLevelInfo(userId, guildId)` — get user + rank + progress
- `recalculateAllLevels()` — batch recalc in transaction
- `forceSetLevel(userId, guildId, newLevel)` — admin command
- `sendLevelUpNotification(client, guildId, user, newLevel)` — sends embed to LEVEL_UP_CHANNEL_ID

Uses: Drizzle DB, CacheService (for boost/vip lookups)

**Step 1: Create xp.constants.ts**

```typescript
export const XP_PER_MESSAGE_MIN = 15;
export const XP_PER_MESSAGE_MAX = 25;
export const XP_COOLDOWN_SECONDS = 60;
export const COINS_PER_XP = 100; // 1 coin per 100 XP
export const MAX_COINS_PER_MESSAGE = 25;
```

**Step 2: Create leveling.service.ts** with all methods ported from database.js lines 120-292 and 765-781

**Step 3: Create leveling.module.ts** importing DatabaseModule, CacheAppModule

**Step 4: Verify build**

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add leveling service with XP, level calculation, and multipliers"
```

---

### Task 6: Economy service

**Files:**
- Create: `src/economy/economy.module.ts`
- Create: `src/economy/economy.service.ts`
- Create: `src/economy/shop.service.ts`
- Create: `src/economy/robux.service.ts`

Port from `database.js`:
- `economy.service.ts`: `addCoins()`, `removeCoins()`, `transferCoins()` (with transaction), `claimDaily()` (3-5 coins, 24h cooldown)
- `shop.service.ts`: `createItem()`, `getAllItems()`, `getItem()`, `getItemByName()`, `buyItem()` (with transaction), `getUserInventory()`, `useItem()` (with VIP activation, boost application, XP packs)
- `robux.service.ts`: `createRedemptionThread()` — creates private thread in ROBUX_REDEMPTION_CHANNEL_ID, adds user, sends embed. `handleRobuxPurchase()` — checks inventory for type='robux', calls createRedemptionThread, removes item

**Step 1: Create economy.service.ts** — port from database.js lines 342-416

**Step 2: Create shop.service.ts** — port from database.js lines 420-606. The `useItem()` method is complex — handles VIP activation (gold/platinum/ruby), XP boosts (2x/3x/5x), XP packs (Tier 1/2/3)

**Step 3: Create robux.service.ts** — NEW feature. Uses discord.js Client to create PrivateThread in channel `1454206289029759138`

**Step 4: Create economy.module.ts**

**Step 5: Verify build**

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add economy, shop, and robux services"
```

---

### Task 7: VIP service

**Files:**
- Create: `src/vip/vip.module.ts`
- Create: `src/vip/vip.service.ts`
- Create: `src/vip/vip.constants.ts`

Port from `database.js` lines 608-699:
- `getActiveVip(userId, guildId)` — deletes expired, returns active
- `activateVip(userId, guildId, tier, multiplier, durationDays)` — deletes existing, inserts new, also creates boost in user_boosts
- `getExpiredVips()` — for cron job
- `deactivateVip(userId, guildId)` — deletes from user_vips AND user_boosts
- `giveVipItem(userId, guildId, tier)` — admin: adds VIP item to inventory

**vip.constants.ts:**
```typescript
export const VIP_TIERS = {
  gold: { multiplier: 2, roleId: '1335433259114434681', price: 600, durationDays: 30 },
  platinum: { multiplier: 3, roleId: '1363761681049845770', price: 1200, durationDays: 30 },
  ruby: { multiplier: 5, roleId: '1446749963236282520', price: 3000, durationDays: 30 },
} as const;
```

**Step 1: Create files**

**Step 2: Verify build**

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add VIP service with tier management and expiration"
```

---

### Task 8: Badges and Missions services

**Files:**
- Create: `src/badges/badges.module.ts`
- Create: `src/badges/badges.service.ts`
- Create: `src/badges/missions.service.ts`

Port from `src/utils/badgeSystem.js` (352 lines). Key difference: uses shared Drizzle instance instead of its own pg Pool.

- `badges.service.ts`: `awardBadge()`, `getUserBadges()`, `checkRankBadge()`, `getAvailableBadges()`, `removeBadge()`
- `missions.service.ts`: `trackProgress()` (replaces `updateMissionProgress` and `incrementMissionProgress`), `completeMission()`, `getUserMissions()`, `getActiveMissions()`

**Step 1: Read badgeSystem.js for exact logic**

**Step 2: Create badges.service.ts and missions.service.ts**

**Step 3: Create badges.module.ts**

**Step 4: Verify build**

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add badges and missions services"
```

---

### Task 9: Seasonal events service

**Files:**
- Create: `src/seasonal/seasonal.module.ts`
- Create: `src/seasonal/seasonal.service.ts`
- Copy: `src/data/seasonal-events.json` → `src/seasonal/seasonal-events.json`

Port from `src/utils/seasonalEvents.js` (322 lines):
- `getActiveEvent()` — checks current date against seasonal-events.json
- `applyEventMultipliers()` — applies seasonal XP/coin multipliers
- `triggerSeasonalEvent()` — random chance to trigger event message

**Step 1: Create files**

**Step 2: Verify build**

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add seasonal events service"
```

---

### Task 10: Utils — Embed generator, SVG generator, Image service

**Files:**
- Create: `src/utils/embed.generator.ts`
- Create: `src/utils/svg.generator.ts`
- Create: `src/utils/image.service.ts`

Port from:
- `src/utils/embedGenerator.js` (436 lines) — all embed templates
- `src/utils/svgGenerator.js` (409 lines) — SVG card generation
- `src/utils/convertSvg.js` + `src/utils/fetchImage.js` — Sharp conversion + image fetching

Add new embed: `robuxRedemptionEmbed(user, quantity)` for the Robux redemption thread.

**Step 1: Create embed.generator.ts** as `@Injectable()` service

**Step 2: Create svg.generator.ts** as `@Injectable()` service

**Step 3: Create image.service.ts** as `@Injectable()` service (Sharp SVG→PNG + image fetch)

**Step 4: Verify build**

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add embed generator, SVG generator, and image service"
```

---

## Phase 3: Bot Layer (Commands, Events, Guards)

### Task 11: Necord bot module setup

**Files:**
- Create: `src/bot/bot.module.ts`
- Modify: `src/app.module.ts`

**Step 1: Install Necord**

```bash
npm install necord discord.js class-validator class-transformer
```

**Step 2: Create bot.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NecordModule } from 'necord';
import { GatewayIntentBits } from 'discord.js';

@Module({
  imports: [
    NecordModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        token: config.get('DISCORD_TOKEN'),
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildVoiceStates,
          GatewayIntentBits.GuildMembers,
        ],
        prefix: config.get('PREFIX'),
      }),
    }),
    // Command and event modules will be imported here
  ],
})
export class BotModule {}
```

**Step 3: Import BotModule in AppModule**

**Step 4: Verify build**

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add Necord bot module with Discord gateway config"
```

---

### Task 12: Guild guard

**Files:**
- Create: `src/bot/guards/allowed-guild.guard.ts`

Creates a Necord guard that rejects interactions from unauthorized guilds. Uses `ALLOWED_GUILDS` env var.

**Step 1: Create guard**

**Step 2: Verify build**

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add allowed guild guard for server whitelist"
```

---

### Task 13: Event listeners

**Files:**
- Create: `src/bot/events/message.listener.ts`
- Create: `src/bot/events/voice.listener.ts`
- Create: `src/bot/events/ready.listener.ts`
- Create: `src/bot/events/guild.listener.ts`

Port from `src/events/`:

**message.listener.ts** — `@On('messageCreate')`:
- Bot check, guild check
- Prefix command routing (handled by Necord's TextCommand system, no manual routing needed)
- XP cooldown via Redis (60s)
- Random XP 15-25
- `leveling.addXp()` → check levelUp → send notification to channel `1449807035389579407`
- `missions.trackProgress('messages', 1)`
- Seasonal event trigger

**voice.listener.ts** — `@On('voiceStateUpdate')`:
- Join → `cache.set('voice:{userId}', Date.now())`
- Leave → delta = now - cached → `leveling.addVoiceTime(delta)` if > MIN_VOICE_SECONDS
- `missions.trackProgress('voice_time', voiceTime)`

**ready.listener.ts** — `@Once('ready')`:
- Log startup
- Set activity
- Initialize voice tracking for users already in voice

**guild.listener.ts** — `@On('guildCreate')` [NEW]:
- If guild.id not in ALLOWED_GUILDS → `guild.leave()`

**Step 1: Create all 4 listeners**

**Step 2: Register in BotModule**

**Step 3: Verify build**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Discord event listeners (message, voice, ready, guild)"
```

---

### Task 14: Slash commands — Leveling group (level, ranking, profile, boost)

**Files:**
- Create: `src/bot/commands/level.command.ts`
- Create: `src/bot/commands/ranking.command.ts`
- Create: `src/bot/commands/profile.command.ts`
- Create: `src/bot/commands/boost.command.ts`
- Create: `src/bot/commands/dto/` (DTOs for each command)

Port from `src/commands/level.js`, `ranking.js`, `profile.js`, `boost.js`. Each command:
1. `@SlashCommand()` decorator with name/description
2. `deferReply()` for image-generating commands
3. Call service → generate image → `editReply({ files: [image] })`

**Step 1: Create DTOs**

**Step 2: Create command classes**

**Step 3: Register in BotModule**

**Step 4: Verify build**

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add leveling slash commands (level, ranking, profile, boost)"
```

---

### Task 15: Slash commands — Economy group (coins, daily, transfer, shop, buy, use, inventory)

**Files:**
- Create: `src/bot/commands/coins.command.ts`
- Create: `src/bot/commands/daily.command.ts`
- Create: `src/bot/commands/transfer.command.ts`
- Create: `src/bot/commands/shop.command.ts`
- Create: `src/bot/commands/buy.command.ts`
- Create: `src/bot/commands/use.command.ts`
- Create: `src/bot/commands/inventory.command.ts`

Port from `src/commands/` equivalents. Each calls EconomyService or ShopService.

**Step 1: Create DTOs**

**Step 2: Create command classes**

**Step 3: Register in BotModule**

**Step 4: Verify build**

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add economy slash commands (coins, daily, transfer, shop, buy, use, inventory)"
```

---

### Task 16: Slash commands — VIP, Badges, Missions

**Files:**
- Create: `src/bot/commands/vip.command.ts`
- Create: `src/bot/commands/badge.command.ts`
- Create: `src/bot/commands/mybadges.command.ts`
- Create: `src/bot/commands/missions.command.ts`

**Step 1: Create command classes**

**Step 2: Register in BotModule**

**Step 3: Verify build**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add VIP, badge, and missions slash commands"
```

---

### Task 17: Slash commands — Utility (bola8, calc, joke) + Admin (time, backup)

**Files:**
- Create: `src/bot/commands/bola8.command.ts`
- Create: `src/bot/commands/calc.command.ts`
- Create: `src/bot/commands/joke.command.ts`
- Create: `src/bot/commands/time.command.ts`
- Create: `src/bot/commands/backup.command.ts`

Self-contained commands (no service needed for bola8/calc/joke). Admin commands have permission checks.

**Step 1: Create command classes**

**Step 2: Register in BotModule**

**Step 3: Verify build**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add utility and admin slash commands"
```

---

### Task 18: Slash command — Resgatar (Robux redemption) [NEW]

**Files:**
- Create: `src/bot/commands/resgatar.command.ts`

New command `/resgatar` that:
1. Checks inventory for items with `type = 'robux'`
2. If found, calls `robux.service.createRedemptionThread()`
3. Creates private thread in channel `1454206289029759138`
4. Removes 1 unit from inventory
5. Replies with confirmation

**Step 1: Create command**

**Step 2: Register in BotModule**

**Step 3: Verify build**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add /resgatar command for Robux redemption via private thread"
```

---

### Task 19: Prefix commands (all 15 + resgatar)

**Files:**
- Create: `src/bot/prefix/level.prefix.ts`
- Create: `src/bot/prefix/ranking.prefix.ts`
- Create: `src/bot/prefix/profile.prefix.ts`
- Create: `src/bot/prefix/shop.prefix.ts`
- Create: `src/bot/prefix/inventory.prefix.ts`
- Create: `src/bot/prefix/coins.prefix.ts`
- Create: `src/bot/prefix/daily.prefix.ts`
- Create: `src/bot/prefix/vip.prefix.ts`
- Create: `src/bot/prefix/vip-activate.prefix.ts`
- Create: `src/bot/prefix/badge.prefix.ts`
- Create: `src/bot/prefix/mybadges.prefix.ts`
- Create: `src/bot/prefix/missions.prefix.ts`
- Create: `src/bot/prefix/help.prefix.ts`
- Create: `src/bot/prefix/bola8.prefix.ts`
- Create: `src/bot/prefix/forcelevel.prefix.ts`
- Create: `src/bot/prefix/resgatar.prefix.ts` [NEW]

Each uses `@TextCommand()` with name and aliases. Shares same services as slash equivalents.

**Step 1: Create all prefix command classes**

**Step 2: Register in BotModule**

**Step 3: Verify build**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add all 16 prefix commands"
```

---

## Phase 4: Workers (Cron Jobs)

### Task 20: Cron jobs — Level recalc, VIP expiration, Guild cleanup

**Files:**
- Create: `src/workers/workers.module.ts`
- Create: `src/workers/level-recalc.cron.ts`
- Create: `src/workers/vip-expiration.cron.ts`
- Create: `src/workers/guild-cleanup.cron.ts`

**Step 1: Install schedule module**

```bash
npm install @nestjs/schedule
```

**Step 2: Create level-recalc.cron.ts** — `@Cron('*/5 * * * *')` calls `leveling.recalculateAllLevels()`

**Step 3: Create vip-expiration.cron.ts** — `@Cron('0 * * * *')` calls `vip.getExpiredVips()`, deactivates each, removes Discord roles, sends DM notification

**Step 4: Create guild-cleanup.cron.ts** — `@Cron('0 */6 * * *')` iterates `client.guilds.cache`, leaves unauthorized guilds

**Step 5: Create workers.module.ts** importing ScheduleModule.forRoot()

**Step 6: Import WorkersModule in AppModule**

**Step 7: Verify build**

**Step 8: Commit**

```bash
git add -A && git commit -m "feat: add cron jobs for level recalc, VIP expiration, and guild cleanup"
```

---

## Phase 5: Seeds & Scripts

### Task 21: Seed scripts

**Files:**
- Create: `src/scripts/seed-shop.ts`
- Create: `src/scripts/seed-badges.ts`
- Create: `src/scripts/seed-vip.ts`

Port from `scripts/seed-shop.js` and `scripts/seed-badges.js`. Add new Robux item and VIP tiers.

**seed-shop.ts** — 9 existing items + Robux placeholder:
- XP Boost 2x (150 coins), XP Boost 3x (300 coins), XP Boost 5x (500 coins)
- Pacote de Experiência Tier 1/2/3
- Boost VIP Gold/Platinum/Ruby (hidden)
- NEW: "Robux - 100" (500 coins, type='robux', hidden=false)

**seed-vip.ts** — 3 VIP tiers as shop items:
- VIP Gold (600 coins, hidden)
- VIP Platinum (1200 coins, hidden)
- VIP Ruby (3000 coins, hidden)

**seed-badges.ts** — port existing badges and missions

**Step 1: Create seed files using Drizzle ORM for DB access**

**Step 2: Add npm scripts:**
```json
{
  "seed:shop": "ts-node src/scripts/seed-shop.ts",
  "seed:badges": "ts-node src/scripts/seed-badges.ts",
  "seed:vip": "ts-node src/scripts/seed-vip.ts",
  "seed": "npm run seed:shop && npm run seed:badges && npm run seed:vip"
}
```

**Step 3: Verify build**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add seed scripts for shop, badges, and VIP tiers"
```

---

### Task 22: Deploy commands script

**Files:**
- Create: `src/scripts/deploy-commands.ts`

Port from `src/deploy-commands.js`. Uses discord.js REST to register slash commands. Must build command data matching the `@SlashCommand()` decorators.

**Step 1: Create deploy-commands.ts**

**Step 2: Add npm script: `"deploy": "ts-node src/scripts/deploy-commands.ts"`**

**Step 3: Verify build**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add deploy-commands script for slash command registration"
```

---

## Phase 6: Infrastructure

### Task 23: Docker setup

**Files:**
- Modify: `Dockerfile` — multi-stage build for TypeScript
- Modify: `docker-compose.yml` — add Redis container
- Modify: `.env.example` — add new env vars

**Step 1: Update Dockerfile**

Multi-stage: builder (compile TS) → runtime (node:20-alpine with sharp deps). Copy dist/, node_modules, media/.

**Step 2: Update docker-compose.yml**

Add `redis` service (redis:7-alpine) with volume and appendonly. Add `REDIS_HOST=redis` and `REDIS_PORT=6379` to bot env.

**Step 3: Update .env.example**

Add: `REDIS_HOST`, `REDIS_PORT`, `ALLOWED_GUILDS`, `LEVEL_UP_CHANNEL_ID`, `ROBUX_REDEMPTION_CHANNEL_ID`

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: update Docker config for NestJS + Redis"
```

---

## Phase 7: Cleanup & Final Verification

### Task 24: Remove old source files

**Files:**
- Delete: `src/index.js`
- Delete: `src/database.js`
- Delete: `src/deploy-commands.js`
- Delete: `src/commands/` (all .js files)
- Delete: `src/prefixCommands/` (all .js files)
- Delete: `src/events/` (all .js files)
- Delete: `src/jobs/` (all .js files)
- Delete: `src/utils/embedGenerator.js`, `badgeSystem.js`, `seasonalEvents.js`, `svgGenerator.js`, `convertSvg.js`, `fetchImage.js`
- Delete: `scripts/` (old JS scripts)

**Step 1: Remove old files**

**Step 2: Verify build still passes**

```bash
npx nest build
```

**Step 3: Commit**

```bash
git add -A && git commit -m "chore: remove old Node.js source files"
```

---

### Task 25: Full integration test

**Step 1: Verify TypeScript compilation**

```bash
npx nest build
```
Expected: Clean build, no errors.

**Step 2: Verify Docker build**

```bash
docker compose build
```
Expected: Build succeeds.

**Step 3: Verify environment**

```bash
docker compose up -d postgres redis
```
Wait for healthy containers.

**Step 4: Run seed scripts**

```bash
npm run seed
```

**Step 5: Start bot locally**

```bash
npm run start:dev
```
Expected: Bot connects, logs "Bot is running!", connects to DB and Redis.

**Step 6: Test basic commands** (manual)

- `/level` — should show level card
- `/shop` — should show shop items including Robux
- `/daily` — should claim daily coins
- `!help` — should show prefix help

**Step 7: Final commit**

```bash
git add -A && git commit -m "chore: final verification and cleanup"
```

---

## Summary

| Phase | Tasks | Description |
|---|---|---|
| 1 | 1-4 | NestJS scaffold, config, database, cache |
| 2 | 5-10 | Domain services (leveling, economy, VIP, badges, seasonal, utils) |
| 3 | 11-19 | Bot layer (Necord, guards, events, slash commands, prefix commands) |
| 4 | 20 | Cron workers (level recalc, VIP expiration, guild cleanup) |
| 5 | 21-22 | Seeds and deploy-commands script |
| 6 | 23 | Docker infrastructure |
| 7 | 24-25 | Cleanup old files, full verification |

**Total: 25 tasks across 7 phases.**
