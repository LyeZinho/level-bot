# NestJS Migration + New Features — Design Document

**Date:** 2026-03-27
**Status:** Approved
**Stack:** NestJS + Necord + Drizzle ORM + PostgreSQL + Redis

## Context

Rewrite of a Discord level/economy bot from plain Node.js/discord.js to NestJS, while simultaneously implementing 5 new features. The existing database schema (9 tables) must be preserved exactly to avoid migration issues.

### User Requests
1. Level-up notifications sent to channel `1449807035389579407`
2. Robux as a shop item (placeholder price)
3. Robux redemption via private thread in channel `1454206289029759138`
4. Auto-leave unauthorized servers (allowed: `832509216895926314`, `963393023486590978`)
5. New seeds for shop and VIP tiers (Gold R$6, Platinum R$12, Ruby R$30)
6. Full refactor to NestJS + Drizzle ORM + PostgreSQL + Redis

---

## Section 1 — NestJS Module Structure

```
src/
├── main.ts                          # Bootstrap NestJS + Necord
├── app.module.ts                    # Root module
│
├── config/
│   ├── config.module.ts             # @nestjs/config with Joi validation
│   └── env.validation.ts            # Schema for all env vars
│
├── database/
│   ├── database.module.ts           # Global module, exports Drizzle instance
│   ├── drizzle.provider.ts          # Factory: node-postgres Pool → drizzle(pool, { schema })
│   └── schema/                      # Generated via drizzle-kit pull (1 file per table)
│       ├── users.ts
│       ├── items.ts
│       ├── user-inventory.ts
│       ├── user-boosts.ts
│       ├── user-vips.ts
│       ├── badges.ts
│       ├── user-badges.ts
│       ├── missions.ts
│       ├── user-missions.ts
│       └── index.ts                 # Re-exports all
│
├── cache/
│   ├── cache.module.ts              # Redis via cache-manager-redis-yet
│   └── cache.service.ts             # Wrapper: get/set/del with TTL + feature prefix
│
├── bot/
│   ├── bot.module.ts                # NecordModule.forRootAsync (token, intents, prefix)
│   ├── commands/                    # 18 slash commands (1 class per command)
│   ├── prefix/                      # 15 prefix commands (1 class per command)
│   ├── events/                      # Event listeners (@On, @Once decorators)
│   └── guards/                      # Guild guard (allowed servers only)
│
├── leveling/
│   ├── leveling.module.ts
│   ├── leveling.service.ts          # addXp(), calculateLevel(), getLevelInfo(), sendLevelUpNotification()
│   └── xp.constants.ts              # XP formula, cooldowns
│
├── economy/
│   ├── economy.module.ts
│   ├── economy.service.ts           # addCoins(), removeCoins(), transfer(), dailyClaim()
│   ├── shop.service.ts              # getItems(), buyItem(), applyItem()
│   └── robux.service.ts             # createRedemptionThread(), handleRobuxPurchase()
│
├── vip/
│   ├── vip.module.ts
│   ├── vip.service.ts               # activateVip(), checkVip(), getMultiplier()
│   └── vip.constants.ts             # Tiers: gold/platinum/ruby + role IDs + multipliers
│
├── badges/
│   ├── badges.module.ts
│   ├── badges.service.ts            # awardBadge(), getUserBadges(), checkRankBadge()
│   └── missions.service.ts          # trackProgress(), completeMission(), getUserMissions()
│
├── seasonal/
│   ├── seasonal.module.ts
│   └── seasonal.service.ts          # getActiveEvent(), applyEventMultipliers()
│
├── workers/
│   ├── workers.module.ts
│   ├── level-recalc.cron.ts         # @Cron('*/5 * * * *')
│   ├── vip-expiration.cron.ts       # @Cron('0 * * * *')
│   └── guild-cleanup.cron.ts        # @Cron('0 */6 * * *')
│
├── utils/
│   ├── embed.generator.ts           # All embed templates
│   ├── svg.generator.ts             # SVG card generation
│   ├── image.service.ts             # Sharp SVG→PNG + image fetching
│   └── seasonal-events.json         # Moved from src/data/
│
├── scripts/
│   ├── seed-shop.ts                 # 9 existing items + Robux placeholder
│   ├── seed-badges.ts               # Existing badges + missions
│   └── seed-vip.ts                  # 3 VIP tiers as shop items
│
└── media/
    ├── t1pix.png, t2pix.png, t3pix.png
```

**Principles:**
- Each module is self-contained: its own service, types, constants
- `database/` and `cache/` are Global modules — injectable anywhere without importing
- `bot/` is the presentation layer — only input parsing and calling services. Zero business logic in commands
- The current `badgeSystem.js` (which creates its own pg Pool) is eliminated — `badges.service.ts` uses the shared Drizzle instance

---

## Section 2 — Drizzle ORM Schema (9 tables)

Generated via `drizzle-kit pull` from existing database. Zero migrations — pull only for introspection.

### users
- PK: `(user_id TEXT, guild_id TEXT)`
- Columns: `username TEXT, xp INT(0), level INT(1), messages INT(0), voice_time INT(0), last_message_at BIGINT(0), coins INT(0), last_daily_claim BIGINT(0), created_at BIGINT`
- Indexes: `idx_guild_xp(guild_id, xp DESC)`, `idx_user_guild(user_id, guild_id)`

### items
- PK: `item_id SERIAL`
- Columns: `name TEXT UNIQUE NOT NULL, description TEXT, price INT NOT NULL, emoji TEXT('📦'), type TEXT('consumable'), hidden BOOL(false), created_at BIGINT`

### user_inventory
- PK: `(user_id TEXT, guild_id TEXT, item_id INT → items.item_id)`
- Columns: `quantity INT(1), acquired_at BIGINT`
- Index: `idx_inventory_user(user_id, guild_id)`

### user_boosts
- PK: `(user_id TEXT, guild_id TEXT, boost_type TEXT)`
- Columns: `multiplier FLOAT NOT NULL, expires_at BIGINT NOT NULL, created_at BIGINT`
- Index: `idx_boosts_expiry(user_id, guild_id, expires_at)`

### user_vips (source-of-truth: database.js)
- PK: `(user_id TEXT, guild_id TEXT, tier TEXT)`
- Columns: `multiplier INTEGER NOT NULL, expires_at BIGINT NOT NULL, active BOOL(true), created_at BIGINT`
- Index: `idx_vips_expiry(user_id, guild_id, expires_at)`
- Note: migrate-all.js has a different schema (vip_tier, FLOAT multiplier, role_id, activated_at, PK without tier). database.js runs on every startup via `CREATE TABLE IF NOT EXISTS`, so it wins.

### badges
- PK: `badge_id SERIAL`
- Columns: `name VARCHAR(100) UNIQUE NOT NULL, description TEXT, image_path VARCHAR(255) NOT NULL, badge_type VARCHAR(50) NOT NULL, tier INT(1), is_active BOOL(true), expires_at BIGINT, created_at BIGINT`

### user_badges
- PK: `id SERIAL`
- Columns: `user_id VARCHAR(30) NOT NULL, guild_id VARCHAR(30) NOT NULL, badge_id INT → badges.badge_id ON DELETE CASCADE, earned_at BIGINT, expires_at BIGINT`
- Constraints: `UNIQUE(user_id, guild_id, badge_id)`
- Index: `idx_user_badges_user(user_id, guild_id)`

### missions
- PK: `mission_id SERIAL`
- Columns: `name VARCHAR(100) NOT NULL, description TEXT, mission_type VARCHAR(50) NOT NULL, target_value INT NOT NULL, reward_badge_id INT → badges.badge_id ON DELETE SET NULL, reward_coins INT(0), is_active BOOL(true), is_repeatable BOOL(false), expires_at BIGINT, created_at BIGINT`

### user_missions
- PK: `id SERIAL`
- Columns: `user_id VARCHAR(30) NOT NULL, guild_id VARCHAR(30) NOT NULL, mission_id INT → missions.mission_id ON DELETE CASCADE, current_value INT(0), completed BOOL(false), completed_at BIGINT, started_at BIGINT`
- Constraints: `UNIQUE(user_id, guild_id, mission_id)`
- Indexes: `idx_user_missions_user(user_id, guild_id)`, `idx_user_missions_mission(mission_id)`

**Key decisions:**
- `bigint` with `mode: 'number'` — maintains compatibility with epoch timestamps used as JS numbers
- `doublePrecision` for `user_boosts.multiplier` — maps PG FLOAT
- `integer` for `user_vips.multiplier` — matches database.js declaration
- `drizzle-kit pull` generates exact types from DB; these schemas serve as validation

---

## Section 3 — Command System (Slash + Prefix)

### Slash Commands (Necord @SlashCommand)

Each command is an `@Injectable()` class. Pattern:

```typescript
@Injectable()
export class LevelCommand {
  constructor(
    private readonly leveling: LevelingService,
    private readonly images: ImageService,
  ) {}

  @SlashCommand({ name: 'level', description: 'Mostra o nível e XP' })
  async onLevel(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: LevelDto,
  ) {
    await interaction.deferReply();
    const target = dto.user ?? interaction.user;
    const data = await this.leveling.getLevelInfo(target.id, interaction.guildId);
    const image = await this.images.generateLevelCard(data, target);
    await interaction.editReply({ files: [image] });
  }
}
```

### Slash command mapping (18 commands):

| Current file | NestJS class | Primary service |
|---|---|---|
| level.js | LevelCommand | LevelingService |
| ranking.js | RankingCommand | LevelingService |
| profile.js | ProfileCommand | LevelingService + BadgesService |
| shop.js | ShopCommand | ShopService |
| buy.js | BuyCommand | ShopService + EconomyService |
| use.js | UseCommand | ShopService + VipService |
| inventory.js | InventoryCommand | ShopService |
| coins.js | CoinsCommand | EconomyService |
| daily.js | DailyCommand | EconomyService |
| transfer.js | TransferCommand | EconomyService |
| vip.js | VipCommand | VipService |
| badge.js | BadgeCommand | BadgesService |
| mybadges.js | MyBadgesCommand | BadgesService |
| missions.js | MissionsCommand | MissionsService |
| boost.js | BoostCommand | LevelingService |
| bola8.js | Bola8Command | (self-contained) |
| calc.js | CalcCommand | (self-contained) |
| joke.js | JokeCommand | (self-contained) |

Admin commands: TimeCommand, BackupCommand (with permission guard).

### Prefix Commands (Necord @TextCommand)

```typescript
@Injectable()
export class LevelPrefixCommand {
  @TextCommand({ name: 'level', aliases: ['lvl'] })
  async onLevel(@Context() [message]: TextCommandContext) {
    const target = message.mentions.users.first() ?? message.author;
    // ... same service calls as slash version
  }
}
```

### Prefix command mapping (15 commands):

| Current file | NestJS class | Aliases |
|---|---|---|
| level.js | LevelPrefixCommand | lvl |
| ranking.js | RankingPrefixCommand | rank, top |
| profile.js | ProfilePrefixCommand | perfil, p |
| shop.js | ShopPrefixCommand | loja |
| inventory.js | InventoryPrefixCommand | inv |
| coins.js | CoinsPrefixCommand | balance |
| daily.js | DailyPrefixCommand | — |
| vip.js | VipPrefixCommand | — |
| vip-activate.js | VipActivatePrefixCommand | — |
| badge.js | BadgePrefixCommand | — |
| mybadges.js | MyBadgesPrefixCommand | — |
| missions.js | MissionsPrefixCommand | — |
| help.js | HelpPrefixCommand | ajuda |
| bola8.js | Bola8PrefixCommand | 8ball |
| forcelevel.js | ForceLevelPrefixCommand | (admin) |

**Principles:**
- Slash and prefix share the same services — zero business logic duplication
- Each command class is responsible ONLY for: input parsing → call service → format response
- DTOs with class-validator for slash commands
- Utility commands (bola8, calc, joke) are self-contained, no service needed

---

## Section 4 — Events and Workers

### Discord Events (4 listeners)

**MessageListener** (`@On('messageCreate')`):
- XP cooldown via Redis (60s)
- Calls `leveling.addXp()` → checks for level-up → sends notification if leveled up
- Calls `economy.addCoinsFromXp()`
- Calls `missions.trackProgress('messages', 1)`

**VoiceListener** (`@On('voiceStateUpdate')`):
- Join → `cache.set('voice:{userId}', Date.now())`
- Leave → delta = now - cached timestamp → `leveling.addVoiceTime(delta)`
- Calls `missions.trackProgress('voice_time', delta)`

**ReadyListener** (`@Once('ready')`):
- Logs startup info

**GuildListener** (`@On('guildCreate')`) [NEW]:
- Checks if guild.id is in allowed list
- If not → `guild.leave()` immediately

### Cron Jobs (@nestjs/schedule)

| Current worker | NestJS Cron | Schedule |
|---|---|---|
| levelWorker.js | LevelRecalcCron | `*/5 * * * *` (every 5 min) |
| vipWorker.js | VipExpirationCron | `0 * * * *` (every hour) |
| (new) | GuildCleanupCron | `0 */6 * * *` (every 6h) |

**VipExpirationCron** also removes Discord roles from expired VIPs.
**GuildCleanupCron** is a safety net for the guildCreate event handler.

**Principles:**
- Events are thin — call services, no business logic
- Cooldowns and temporary state (voice tracking) live in Redis, not in memory
- Crons replace setInterval — more robust, survive restarts

---

## Section 5 — New Features

### Feature 1: Level-Up Notifications

**Channel:** `1449807035389579407` (configurable via `LEVEL_UP_CHANNEL_ID` env var)

`LevelingService.addXp()` returns `{ xpGained, leveledUp, newLevel }`. When `leveledUp` is true, `MessageListener` calls `leveling.sendLevelUpNotification()` which sends an embed to the configured channel.

### Feature 2: Robux Shop Item

New item seeded into `items` table:
```sql
INSERT INTO items (name, description, price, emoji, type, hidden)
VALUES ('Robux - 100', 'Gift card de 100 Robux', 500, '💎', 'robux', false);
```
Purchased via normal `BuyCommand` / `ShopService.buyItem()` flow. Item goes to `user_inventory`.

### Feature 3: Robux Redemption via Private Thread

**Channel:** `1454206289029759138` (configurable via `ROBUX_REDEMPTION_CHANNEL_ID` env var)

New commands: `/resgatar` (slash) and `!resgatar` (prefix).

Flow:
1. User runs `/resgatar`
2. Bot checks inventory for items with `type = 'robux'`
3. Bot creates private thread in the configured channel
4. Thread name: `resgate-{username}-{timestamp}`
5. Bot adds user to thread, sends redemption embed
6. Removes 1 unit from inventory

### Feature 4: Auto-Leave Unauthorized Servers

**Allowed guilds:** Configurable via `ALLOWED_GUILDS` env var (comma-separated).

Dual protection:
1. `@On('guildCreate')` — immediate leave if not in allowed list
2. `GuildCleanupCron` — every 6h sweeps all guilds (safety net)

Guard: `AllowedGuildGuard` applied to all commands — rejects interactions from unauthorized guilds.

### Feature 5: VIP and Shop Seeds

**seed-shop.ts:** Preserves 9 existing items + adds Robux placeholder.

**seed-vip.ts (new):**

| Tier | Price (coins) | XP Multiplier | Benefits | Role ID |
|---|---|---|---|---|
| Gold | 600 | 1.5x | +50% XP, exclusive badge | 1335433259114434681 |
| Platinum | 1200 | 2.0x | +100% XP, badge, daily 2x | 1363761681049845770 |
| Ruby | 3000 | 3.0x | +200% XP, badge, daily 3x, VIP access | 1446749963236282520 |

VIP items are `hidden: true` — only visible via `/vip` command.

---

## Section 6 — Infrastructure

### Docker Compose

Added Redis container (redis:7-alpine) alongside existing PostgreSQL. Redis data persisted via appendonly and volume.

### Dockerfile

Multi-stage build: builder stage compiles TypeScript → `dist/`, runtime stage copies only compiled output + node_modules + media files. Base image: node:20-alpine with sharp native deps.

### Environment Variables

New env vars added:
- `REDIS_HOST`, `REDIS_PORT` — Redis connection
- `ALLOWED_GUILDS` — Comma-separated list of allowed guild IDs
- `LEVEL_UP_CHANNEL_ID` — Channel for level-up notifications
- `ROBUX_REDEMPTION_CHANNEL_ID` — Channel for robux redemption threads

### Dependencies

**Runtime:** @nestjs/common, @nestjs/core, @nestjs/config, @nestjs/schedule, necord, discord.js, drizzle-orm, pg, cache-manager, cache-manager-redis-yet, sharp, class-validator, class-transformer, joi, reflect-metadata, rxjs

**Dev:** @nestjs/cli, drizzle-kit, typescript, @types/pg, @types/node

### Deploy Commands

Standalone script `scripts/deploy-commands.ts` using discord.js REST API. Imports command metadata from Necord-decorated classes.

---

## Key Constants

| Constant | Value |
|---|---|
| Level-up channel | 1449807035389579407 |
| Robux redemption channel | 1454206289029759138 |
| Allowed guild 1 | 832509216895926314 |
| Allowed guild 2 | 963393023486590978 |
| VIP Gold role | 1335433259114434681 |
| VIP Platinum role | 1363761681049845770 |
| VIP Ruby role | 1446749963236282520 |
| VIP category | 1067725669150240818 |
| PityCoin emoji | `<:pitycoin:1448368905948102897>` |

## Constraints

- **Zero DB migrations** — existing 9-table schema preserved exactly
- **drizzle-kit pull** only — introspect, never push
- All channel/guild IDs configurable via env vars (hardcoded as defaults)
- Bot must work with existing data — no data loss on migration
