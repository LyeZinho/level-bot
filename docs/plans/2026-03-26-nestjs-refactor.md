# NestJS Modular Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers/executing-plans to implement this plan task-by-task.

**Goal:** Refactor Discord bot from monolithic JavaScript to enterprise-grade NestJS modular architecture with TypeScript, Drizzle ORM, PostgreSQL, Redis, Zod validation, and DTOs.

**Architecture:** 7 feature-based modules (levels, economy, badges, missions, profiles, inventory, shop, discord) with clear separation of concerns. Data layer via Drizzle with repositories. Validation layer with Zod. Redis caching layer for performance. All existing functionality ported from 18 commands across ~4500 lines of code.

**Tech Stack:** NestJS, TypeScript, Drizzle ORM, PostgreSQL, Redis, Zod, discord.js v14, Jest for unit tests

---

## Phase 1: Project Setup & Infrastructure

### Task 1: Initialize NestJS Project Structure

**Files:**
- Create: `package.json` (new)
- Create: `tsconfig.json`
- Create: `nest-cli.json`
- Create: `src/main.ts`
- Create: `src/app.module.ts`
- Create: `.env.example`

**Step 1: Backup current package.json and create new one**

Run: `cp package.json package.json.backup`

Update package.json:
```json
{
  "name": "level-bot-v2",
  "version": "2.0.0",
  "description": "Discord bot - NestJS modular architecture",
  "main": "dist/main.js",
  "type": "module",
  "scripts": {
    "start": "node dist/main.js",
    "dev": "nest start --watch",
    "build": "nest build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "tsx scripts/migrate.ts",
    "db:seed": "tsx scripts/seed.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "discord.js": "^14.14.1",
    "drizzle-orm": "^0.29.0",
    "pg": "^8.11.3",
    "redis": "^4.6.0",
    "zod": "^3.22.0",
    "dotenv": "^16.3.1",
    "reflect-metadata": "^0.1.13"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/testing": "^10.3.0",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "drizzle-kit": "^0.20.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "module": "esnext",
    "target": "ES2020",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

**Step 3: Create nest-cli.json**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": [
      "@nestjs/swagger/plugin"
    ]
  }
}
```

**Step 4: Create src/main.ts**

```typescript
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🤖 Bot iniciado na porta ${port}`);
}

bootstrap().catch(err => {
  console.error('❌ Erro ao iniciar bot:', err);
  process.exit(1);
});
```

**Step 5: Create src/app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from './modules/discord/discord.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DiscordModule,
  ],
})
export class AppModule {}
```

**Step 6: Create .env.example**

```env
# Discord
DISCORD_TOKEN=your_token_here
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id

# Database
DATABASE_URL=postgresql://levelbot:levelbot123@localhost:5432/levelbot

# Redis
REDIS_URL=redis://localhost:6379

# Environment
NODE_ENV=development
PORT=3000
```

**Step 7: Install dependencies**

Run: `npm install`
Expected: All packages installed successfully

**Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json nest-cli.json src/main.ts src/app.module.ts .env.example
git commit -m "chore: initialize NestJS project structure"
```

---

### Task 2: Setup Drizzle ORM with PostgreSQL

**Files:**
- Create: `src/config/database.config.ts`
- Create: `src/database/schema.ts`
- Create: `drizzle.config.ts`
- Create: `src/database/db.ts`

**Step 1: Create drizzle config**

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://levelbot:levelbot123@localhost:5432/levelbot',
  },
  strict: true,
  verbose: true,
});
```

**Step 2: Create base schema with users table**

```typescript
// src/database/schema.ts
import { pgTable, text, integer, timestamp, decimal, boolean, serial, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ===== CORE USERS =====
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    discordId: text('discord_id').unique().notNull(),
    guildId: text('guild_id').notNull(),
    username: text('username').notNull(),
    avatar: text('avatar'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    discordIdIdx: index('users_discord_id_idx').on(table.discordId),
    guildIdIdx: index('users_guild_id_idx').on(table.guildId),
  }),
);

// ===== LEVELS & XP =====
export const userLevels = pgTable(
  'user_levels',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    guildId: text('guild_id').notNull(),
    xp: integer('xp').default(0).notNull(),
    level: integer('level').default(1).notNull(),
    totalXp: integer('total_xp').default(0).notNull(),
    voiceSeconds: integer('voice_seconds').default(0).notNull(),
    messageCount: integer('message_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdGuildIdIdx: index('user_levels_user_guild_idx').on(table.userId, table.guildId),
    levelIdx: index('user_levels_level_idx').on(table.level),
  }),
);

// ===== COINS =====
export const userCoins = pgTable(
  'user_coins',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    guildId: text('guild_id').notNull(),
    balance: integer('balance').default(0).notNull(),
    totalEarned: integer('total_earned').default(0).notNull(),
    totalSpent: integer('total_spent').default(0).notNull(),
    lastDailyAt: timestamp('last_daily_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdGuildIdIdx: index('user_coins_user_guild_idx').on(table.userId, table.guildId),
  }),
);

// ===== ITEMS & SHOP =====
export const items = pgTable(
  'items',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    price: integer('price').notNull(),
    emoji: text('emoji'),
    type: text('type').notNull(), // 'consumable', 'cosmetic', 'role', 'mystery'
    rarity: text('rarity').default('common'), // 'common', 'rare', 'epic', 'legendary'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    typeIdx: index('items_type_idx').on(table.type),
  }),
);

// ===== INVENTORY =====
export const userInventory = pgTable(
  'user_inventory',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    itemId: integer('item_id').notNull().references(() => items.id),
    quantity: integer('quantity').default(1).notNull(),
    obtainedAt: timestamp('obtained_at').defaultNow().notNull(),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdItemIdIdx: index('user_inventory_user_item_idx').on(table.userId, table.itemId),
  }),
);

// ===== BADGES =====
export const badges = pgTable(
  'badges',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    description: text('description'),
    emoji: text('emoji').notNull(),
    rarity: text('rarity').default('common'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index('badges_name_idx').on(table.name),
  }),
);

export const userBadges = pgTable(
  'user_badges',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    badgeId: integer('badge_id').notNull().references(() => badges.id),
    obtainedAt: timestamp('obtained_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdBadgeIdIdx: index('user_badges_user_badge_idx').on(table.userId, table.badgeId),
  }),
);

// ===== MISSIONS =====
export const missions = pgTable(
  'missions',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    type: text('type').notNull(), // 'daily', 'weekly', 'monthly', 'special'
    requirement: integer('requirement').notNull(), // XP required, messages, etc
    reward: integer('reward').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    typeIdx: index('missions_type_idx').on(table.type),
  }),
);

export const userMissions = pgTable(
  'user_missions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    missionId: integer('mission_id').notNull().references(() => missions.id),
    progress: integer('progress').default(0).notNull(),
    completed: boolean('completed').default(false).notNull(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdMissionIdIdx: index('user_missions_user_mission_idx').on(table.userId, table.missionId),
  }),
);

// ===== VOICE SESSIONS =====
export const voiceSessions = pgTable(
  'voice_sessions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    guildId: text('guild_id').notNull(),
    channelId: text('channel_id').notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    leftAt: timestamp('left_at'),
    duration: integer('duration'), // seconds
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdGuildIdIdx: index('voice_sessions_user_guild_idx').on(table.userId, table.guildId),
  }),
);

// ===== RELATIONS =====
export const usersRelations = relations(users, ({ one, many }) => ({
  levels: many(userLevels),
  coins: many(userCoins),
  badges: many(userBadges),
  inventory: many(userInventory),
  missions: many(userMissions),
  voiceSessions: many(voiceSessions),
}));

export const userLevelsRelations = relations(userLevels, ({ one }) => ({
  user: one(users, {
    fields: [userLevels.userId],
    references: [users.id],
  }),
}));

export const userCoinsRelations = relations(userCoins, ({ one }) => ({
  user: one(users, {
    fields: [userCoins.userId],
    references: [users.id],
  }),
}));

export const userInventoryRelations = relations(userInventory, ({ one }) => ({
  user: one(users, {
    fields: [userInventory.userId],
    references: [users.id],
  }),
  item: one(items, {
    fields: [userInventory.itemId],
    references: [items.id],
  }),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const userMissionsRelations = relations(userMissions, ({ one }) => ({
  user: one(users, {
    fields: [userMissions.userId],
    references: [users.id],
  }),
  mission: one(missions, {
    fields: [userMissions.missionId],
    references: [missions.id],
  }),
}));

export const voiceSessionsRelations = relations(voiceSessions, ({ one }) => ({
  user: one(users, {
    fields: [voiceSessions.userId],
    references: [users.id],
  }),
}));
```

**Step 3: Create database connection module**

```typescript
// src/database/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;
```

**Step 4: Create database config**

```typescript
// src/config/database.config.ts
import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://levelbot:levelbot123@localhost:5432/levelbot',
  migrationsPath: './drizzle/migrations',
}));
```

**Step 5: Generate migrations**

Run: `npm run db:generate`
Expected: Migration file created in `drizzle/migrations/`

**Step 6: Commit**

```bash
git add src/database/ src/config/database.config.ts drizzle.config.ts drizzle/migrations/
git commit -m "feat: setup Drizzle ORM and PostgreSQL schema"
```

---

### Task 3: Setup Redis Integration

**Files:**
- Create: `src/config/redis.config.ts`
- Create: `src/redis/redis.module.ts`
- Create: `src/redis/redis.service.ts`
- Create: `src/common/decorators/cache.decorator.ts`

**Step 1: Create Redis config**

```typescript
// src/config/redis.config.ts
import { registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis', () => ({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  ttlUserData: 300, // 5 minutes
  ttlRanking: 600, // 10 minutes
  ttlCoins: 120, // 2 minutes
  ttlProfile: 3600, // 1 hour
}));
```

**Step 2: Create Redis service**

```typescript
// src/redis/redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client = createClient({
    url: this.configService.get<string>('REDIS_URL'),
  });

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.client.connect();
    console.log('✅ Redis conectado');
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), {
      EX: ttl,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) > 0;
  }
}
```

**Step 3: Create Redis module**

```typescript
// src/redis/redis.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
```

**Step 4: Create cache decorator**

```typescript
// src/common/decorators/cache.decorator.ts
export const CacheKey = (key: string, ttl: number = 300) => {
  return {
    key,
    ttl,
  };
};
```

**Step 5: Commit**

```bash
git add src/redis/ src/config/redis.config.ts src/common/
git commit -m "feat: setup Redis caching layer"
```

---

## Phase 2: Discord Integration & Core Module

### Task 4: Setup Discord Module with Event Handlers

**Files:**
- Create: `src/modules/discord/discord.module.ts`
- Create: `src/modules/discord/discord.service.ts`
- Create: `src/modules/discord/events/`
- Create: `src/modules/discord/events/message-create.event.ts`
- Create: `src/modules/discord/events/voice-state-update.event.ts`
- Create: `src/modules/discord/events/ready.event.ts`

**Step 1: Create Discord service**

```typescript
// src/modules/discord/discord.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { readdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class DiscordService implements OnModuleInit {
  private client: Client;

  constructor(private configService: ConfigService) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
      ],
    });
  }

  async onModuleInit() {
    await this.setupEventHandlers();
    await this.login();
  }

  private async setupEventHandlers() {
    // Event handlers will be registered by modules
  }

  private async login() {
    const token = this.configService.get<string>('DISCORD_TOKEN');
    if (!token) {
      throw new Error('DISCORD_TOKEN não configurado');
    }
    await this.client.login(token);
    console.log('✅ Bot Discord conectado');
  }

  getClient(): Client {
    return this.client;
  }

  async registerSlashCommands(commands: any[]) {
    const rest = new REST({ version: '10' }).setToken(
      this.configService.get<string>('DISCORD_TOKEN'),
    );

    try {
      console.log('🔄 Registrando slash commands...');
      const guildId = this.configService.get<string>('GUILD_ID');
      await rest.put(
        Routes.applicationGuildCommands(
          this.configService.get<string>('CLIENT_ID'),
          guildId,
        ),
        { body: commands },
      );
      console.log(`✅ ${commands.length} slash commands registrados`);
    } catch (error) {
      console.error('❌ Erro ao registrar commands:', error);
    }
  }
}
```

**Step 2: Create Discord module**

```typescript
// src/modules/discord/discord.module.ts
import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { RedisModule } from '@/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
```

**Step 3: Create event handlers directory structure**

```bash
mkdir -p src/modules/discord/events
```

**Step 4: Create ready event**

```typescript
// src/modules/discord/events/ready.event.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscordService } from '../discord.service';

@Injectable()
export class ReadyEventHandler implements OnModuleInit {
  constructor(private discordService: DiscordService) {}

  onModuleInit() {
    const client = this.discordService.getClient();
    
    client.once('ready', (readyClient) => {
      console.log(`✅ Bot pronto como ${readyClient.user.tag}`);
    });
  }
}
```

**Step 5: Create message create event**

```typescript
// src/modules/discord/events/message-create.event.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscordService } from '../discord.service';

@Injectable()
export class MessageCreateEventHandler implements OnModuleInit {
  constructor(private discordService: DiscordService) {}

  onModuleInit() {
    const client = this.discordService.getClient();
    
    client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      // Prefix commands será implementado nos módulos específicos
    });
  }
}
```

**Step 6: Create voice state update event**

```typescript
// src/modules/discord/events/voice-state-update.event.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscordService } from '../discord.service';

@Injectable()
export class VoiceStateUpdateEventHandler implements OnModuleInit {
  constructor(private discordService: DiscordService) {}

  onModuleInit() {
    const client = this.discordService.getClient();
    
    client.on('voiceStateUpdate', async (oldState, newState) => {
      // Voice tracking será implementado no módulo de levels
    });
  }
}
```

**Step 7: Commit**

```bash
git add src/modules/discord/
git commit -m "feat: setup Discord client and event handlers"
```

---

## Phase 3: Core Modules - Levels & XP

### Task 5: Create Levels Module with Repositories & DTOs

**Files:**
- Create: `src/modules/levels/levels.module.ts`
- Create: `src/modules/levels/levels.service.ts`
- Create: `src/modules/levels/levels.controller.ts`
- Create: `src/modules/levels/levels.repository.ts`
- Create: `src/modules/levels/dto/create-xp.dto.ts`
- Create: `src/modules/levels/dto/get-level.dto.ts`

**Step 1: Create DTOs with Zod validation**

```typescript
// src/modules/levels/dto/create-xp.dto.ts
import { z } from 'zod';

export const CreateXPSchema = z.object({
  discordId: z.string().min(1, 'Discord ID obrigatório'),
  guildId: z.string().min(1, 'Guild ID obrigatório'),
  amount: z.number().int().positive('Quantidade deve ser positiva'),
  type: z.enum(['message', 'voice']).default('message'),
});

export type CreateXPDto = z.infer<typeof CreateXPSchema>;

// src/modules/levels/dto/get-level.dto.ts
export const GetLevelSchema = z.object({
  discordId: z.string().min(1),
  guildId: z.string().min(1),
});

export type GetLevelDto = z.infer<typeof GetLevelSchema>;

// src/modules/levels/dto/get-ranking.dto.ts
export const GetRankingSchema = z.object({
  guildId: z.string().min(1),
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

export type GetRankingDto = z.infer<typeof GetRankingSchema>;
```

**Step 2: Create Levels repository**

```typescript
// src/modules/levels/levels.repository.ts
import { Injectable } from '@nestjs/common';
import { db } from '@/database/db';
import { users, userLevels } from '@/database/schema';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class LevelsRepository {
  async getOrCreateUser(discordId: string, guildId: string, username: string) {
    const existingUser = await db.query.users.findFirst({
      where: and(eq(users.discordId, discordId), eq(users.guildId, guildId)),
    });

    if (existingUser) return existingUser;

    const [newUser] = await db
      .insert(users)
      .values({
        discordId,
        guildId,
        username,
      })
      .returning();

    return newUser;
  }

  async getOrCreateLevel(userId: number, guildId: string) {
    const existingLevel = await db.query.userLevels.findFirst({
      where: and(eq(userLevels.userId, userId), eq(userLevels.guildId, guildId)),
    });

    if (existingLevel) return existingLevel;

    const [newLevel] = await db
      .insert(userLevels)
      .values({
        userId,
        guildId,
        xp: 0,
        level: 1,
        totalXp: 0,
      })
      .returning();

    return newLevel;
  }

  async addXP(userId: number, guildId: string, amount: number) {
    const levels = await db.query.userLevels.findFirst({
      where: and(eq(userLevels.userId, userId), eq(userLevels.guildId, guildId)),
    });

    if (!levels) throw new Error('Nível não encontrado');

    const newXP = levels.xp + amount;
    const newTotalXP = levels.totalXp + amount;
    const newLevel = Math.floor(newTotalXP / 1000) + 1; // 1000 XP por level

    const [updated] = await db
      .update(userLevels)
      .set({
        xp: newXP % 1000,
        level: newLevel,
        totalXp: newTotalXP,
        updatedAt: new Date(),
      })
      .where(eq(userLevels.id, levels.id))
      .returning();

    return updated;
  }

  async getUserLevel(userId: number, guildId: string) {
    return db.query.userLevels.findFirst({
      where: and(eq(userLevels.userId, userId), eq(userLevels.guildId, guildId)),
    });
  }

  async getRanking(guildId: string, limit: number, offset: number) {
    return db.query.userLevels.findMany({
      where: eq(userLevels.guildId, guildId),
      limit,
      offset,
      orderBy: [desc(userLevels.level), desc(userLevels.totalXp)],
      with: {
        user: true,
      },
    });
  }

  async incrementMessageCount(userId: number, guildId: string) {
    const levels = await db.query.userLevels.findFirst({
      where: and(eq(userLevels.userId, userId), eq(userLevels.guildId, guildId)),
    });

    if (!levels) throw new Error('Nível não encontrado');

    const [updated] = await db
      .update(userLevels)
      .set({
        messageCount: levels.messageCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(userLevels.id, levels.id))
      .returning();

    return updated;
  }

  async addVoiceSeconds(userId: number, guildId: string, seconds: number) {
    const levels = await db.query.userLevels.findFirst({
      where: and(eq(userLevels.userId, userId), eq(userLevels.guildId, guildId)),
    });

    if (!levels) throw new Error('Nível não encontrado');

    const [updated] = await db
      .update(userLevels)
      .set({
        voiceSeconds: levels.voiceSeconds + seconds,
        updatedAt: new Date(),
      })
      .where(eq(userLevels.id, levels.id))
      .returning();

    return updated;
  }
}
```

**Step 3: Create Levels service**

```typescript
// src/modules/levels/levels.service.ts
import { Injectable } from '@nestjs/common';
import { LevelsRepository } from './levels.repository';
import { RedisService } from '@/redis/redis.service';
import { CreateXPDto } from './dto/create-xp.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LevelsService {
  private readonly XP_PER_LEVEL = 1000;

  constructor(
    private levelsRepository: LevelsRepository,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async addXP(dto: CreateXPDto) {
    const user = await this.levelsRepository.getOrCreateUser(
      dto.discordId,
      dto.guildId,
      'Unknown',
    );

    const level = await this.levelsRepository.getOrCreateLevel(
      user.id,
      dto.guildId,
    );

    const updated = await this.levelsRepository.addXP(user.id, dto.guildId, dto.amount);

    // Invalidate cache
    await this.redisService.invalidatePattern(`levels:user:${user.id}:*`);
    await this.redisService.invalidatePattern(`ranking:${dto.guildId}`);

    return updated;
  }

  async getUserLevel(discordId: string, guildId: string) {
    // Try cache first
    const cacheKey = `levels:user:${discordId}:${guildId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    // Get from DB
    const user = await this.levelsRepository.getOrCreateUser(
      discordId,
      guildId,
      'Unknown',
    );

    const level = await this.levelsRepository.getOrCreateLevel(user.id, guildId);
    const userInfo = await this.levelsRepository.getUserLevel(user.id, guildId);

    const result = { user, level: userInfo };

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, result, 300);

    return result;
  }

  async getRanking(guildId: string, limit: number = 10, offset: number = 0) {
    // Try cache first
    const cacheKey = `ranking:${guildId}:${limit}:${offset}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const ranking = await this.levelsRepository.getRanking(guildId, limit, offset);

    // Cache for 10 minutes
    await this.redisService.set(cacheKey, ranking, 600);

    return ranking;
  }

  async incrementMessageCount(discordId: string, guildId: string) {
    const user = await this.levelsRepository.getOrCreateUser(
      discordId,
      guildId,
      'Unknown',
    );

    return this.levelsRepository.incrementMessageCount(user.id, guildId);
  }

  async addVoiceSeconds(discordId: string, guildId: string, seconds: number) {
    const user = await this.levelsRepository.getOrCreateUser(
      discordId,
      guildId,
      'Unknown',
    );

    return this.levelsRepository.addVoiceSeconds(user.id, guildId, seconds);
  }
}
```

**Step 4: Create Levels controller**

```typescript
// src/modules/levels/levels.controller.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SlashCommandBuilder } from 'discord.js';
import { LevelsService } from './levels.service';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class LevelsController implements OnModuleInit {
  private slashCommands: any[] = [];

  constructor(
    private levelsService: LevelsService,
    private discordService: DiscordService,
  ) {}

  onModuleInit() {
    this.setupSlashCommands();
    this.setupEventHandlers();
  }

  private setupSlashCommands() {
    this.slashCommands.push(
      new SlashCommandBuilder()
        .setName('level')
        .setDescription('Mostra seu nível e XP')
        .addUserOption((option) =>
          option
            .setName('usuario')
            .setDescription('Usuário (padrão: você)')
            .setRequired(false),
        )
        .toJSON(),

      new SlashCommandBuilder()
        .setName('ranking')
        .setDescription('Mostra o ranking de níveis')
        .addNumberOption((option) =>
          option
            .setName('limite')
            .setDescription('Quantos usuários mostrar (1-100)')
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(false),
        )
        .toJSON(),
    );

    this.discordService.registerSlashCommands(this.slashCommands);
  }

  private setupEventHandlers() {
    const client = this.discordService.getClient();

    client.on('messageCreate', async (message) => {
      if (message.author.bot || !message.guild) return;

      try {
        await this.levelsService.incrementMessageCount(
          message.author.id,
          message.guildId,
        );
      } catch (error) {
        console.error('Erro ao incrementar mensagens:', error);
      }
    });
  }
}
```

**Step 5: Create Levels module**

```typescript
// src/modules/levels/levels.module.ts
import { Module } from '@nestjs/common';
import { LevelsService } from './levels.service';
import { LevelsController } from './levels.controller';
import { LevelsRepository } from './levels.repository';
import { RedisModule } from '@/redis/redis.module';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [RedisModule, DiscordModule],
  providers: [LevelsService, LevelsRepository, LevelsController],
  exports: [LevelsService],
})
export class LevelsModule {}
```

**Step 6: Update app.module to include levels**

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from './modules/discord/discord.module';
import { LevelsModule } from './modules/levels/levels.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DiscordModule,
    LevelsModule,
  ],
})
export class AppModule {}
```

**Step 7: Commit**

```bash
git add src/modules/levels/ src/app.module.ts
git commit -m "feat: implement levels module with XP system"
```

---

## Phase 4: Economy Module

### Task 6: Create Economy Module

*(Due to length, structure similar to Levels module)*

**Files to create:**
- `src/modules/economy/economy.module.ts`
- `src/modules/economy/economy.service.ts`
- `src/modules/economy/economy.controller.ts`
- `src/modules/economy/economy.repository.ts`
- `src/modules/economy/dto/add-coins.dto.ts`
- `src/modules/economy/dto/transfer-coins.dto.ts`

**Implementation pattern:** Same as Levels module - repository, service, controller with Zod DTOs and Redis caching.

---

## Phase 5: Remaining Modules

### Task 7-10: Create remaining modules

Create in order:
- **ShopModule** - Item management, sell/buy logic
- **InventoryModule** - User inventory, item usage
- **BadgesModule** - Badge awarding, tracking
- **MissionsModule** - Quest system, rewards

Each follows the same pattern as Levels/Economy.

---

## Phase 6: Database Migration & Data Import

### Task 11: Migrate Data from Old Database

**Files:**
- Create: `scripts/migrate.ts`
- Create: `scripts/seed-old-data.ts`

**Process:**
1. Connect to old PostgreSQL
2. Export user data, XP, coins
3. Import into new schema with transformation
4. Verify data integrity (counts, checksums)

---

## Phase 7: Testing

### Task 12: Write Unit Tests

**Files:**
- Create: `src/modules/levels/levels.service.spec.ts`
- Create: `src/modules/economy/economy.service.spec.ts`

Test critical business logic:
- XP calculations and level progression
- Coin transactions
- Daily rewards
- Inventory operations

---

## Phase 8: Docker & Production Setup

### Task 13: Update Docker Configuration

**Files:**
- Update: `docker-compose.yml`
- Create: `Dockerfile`

Configure PostgreSQL 16, Redis, Node.js container.

---

## Execution Notes

- **Each task is 1-2 hours** of focused development
- **Commit after every logical step** to maintain clean history
- **Run tests after modules complete** to catch issues early
- **Redis cache invalidation** on every write operation
- **Type safety** enforced via TypeScript strict mode + Zod
- **DTOs** validated at entry point (controller) before service processing

---

**TOTAL ESTIMATED TIME: 40-50 hours of focused work**

Ready to execute? Use `superpowers/executing-plans` or `superpowers/subagent-driven-development` to implement task by task.
