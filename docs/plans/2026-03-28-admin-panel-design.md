# Level Bot Admin Panel - Design Document

**Date:** 2026-03-28  
**Status:** APPROVED  
**Version:** 1.0

---

## Executive Summary

Transform level-bot into a **Turborepo monorepo** with:
1. **`apps/bot`** - NestJS Discord bot (existing, refactored slightly)
2. **`apps/api`** - NestJS admin backend API (new)
3. **`apps/web`** - Svelte admin panel (new)
4. **`packages/shared`** - Shared types, schemas, constants
5. **`packages/db`** - Drizzle ORM configuration

The admin panel provides **complete control** over bot functionality with **Discord OAuth2 authentication**, **JWT security**, **Redis caching**, and **neobrutalistic UI** (black/gray/purple).

---

## 1. Architecture Overview

### Monorepo Structure

```
level-bot-monorepo/
├── apps/
│   ├── bot/                    # NestJS bot (Discord.js + Necord)
│   │   ├── src/
│   │   ├── dist/
│   │   └── package.json
│   ├── api/                    # NestJS API (Admin backend, NEW)
│   │   ├── src/
│   │   │   ├── auth/           # Discord OAuth2 + JWT validation
│   │   │   ├── admin/          # Admin endpoints
│   │   │   ├── users/          # User management endpoints
│   │   │   ├── items/          # Shop item endpoints
│   │   │   ├── badges/         # Badge management endpoints
│   │   │   ├── vips/           # VIP tier endpoints
│   │   │   ├── events/         # Seasonal events endpoints
│   │   │   ├── logs/           # Audit logs endpoints
│   │   │   ├── settings/       # Bot settings endpoints
│   │   │   └── shared/         # DB access (Drizzle)
│   │   └── package.json
│   └── web/                    # Svelte admin panel (NEW)
│       ├── src/
│       │   ├── lib/
│       │   │   ├── api.ts      # API client (HTTP + JWT)
│       │   │   ├── auth.ts     # Auth store (Svelte)
│       │   │   └── components/ # Reusable components
│       │   ├── routes/         # Pages (one per feature)
│       │   └── app.svelte
│       ├── svelte.config.js
│       └── package.json
├── packages/
│   ├── shared/                 # Shared code (NEW)
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces
│   │   │   ├── schemas/        # Drizzle schemas (re-exported)
│   │   │   ├── constants/      # Bot constants
│   │   │   └── index.ts
│   │   └── package.json
│   └── db/                     # Drizzle config (NEW)
│       ├── schema.ts           # All schemas unified
│       ├── drizzle.config.ts
│       └── package.json
├── turbo.json                  # Turborepo orchestration
├── tsconfig.json               # Root TypeScript config
├── pnpm-workspace.yaml         # pnpm workspaces
├── MIGRATION_GUIDE.md          # (existing)
├── Dockerfile                  # (update for multi-service)
└── docker-compose.yml          # 4 services: postgres, redis, bot, api
```

### Data Flow

```
User Browser
    ↓
    └─→ web (Svelte) ─→ HTTP + JWT ─→ api (NestJS)
                                        ↓
                                    Drizzle ORM
                                        ↓
                                    PostgreSQL
                                        ↓
                                    Redis Cache

bot (NestJS)
    ↓
    └─→ Discord Events
        & Drizzle ORM access
        & Redis cache reads
```

### Package Dependencies

```
web → api (HTTP client)
web → @shared (types)
api → @shared (types)
api → @db (Drizzle)
bot → @shared (types)
bot → @db (Drizzle)
```

---

## 2. Authentication & Security

### Discord OAuth2 Flow

1. User clicks "Login with Discord" button
2. Redirects to Discord OAuth2 endpoint
3. User grants permissions (read guild, read roles)
4. Discord redirects back with `code`
5. Backend exchanges `code` for `access_token`
6. Backend validates user role in Discord guild
7. If authorized, generate JWT tokens:
   - **Access Token** (JWT, 15 minutes): Short-lived, in Authorization header
   - **Refresh Token** (JWT, 7 days): In httpOnly cookie, never exposed to JS
8. Return access token + user info to frontend
9. Frontend stores access token in memory (cleared on refresh)
10. Refresh token handled by fetch middleware automatically

### JWT Claims

```typescript
// Access Token
{
  sub: "discord_user_id",
  discord_id: "123456789",
  discord_username: "username",
  role: "admin" | "moderator",    // Discord guild role
  guild_id: "guild_id",
  iat: 1234567890,
  exp: 1234568890                 // 15 min
}

// Refresh Token
{
  sub: "discord_user_id",
  type: "refresh",
  iat: 1234567890,
  exp: 1234654290                 // 7 days
}
```

### Security Measures

✅ **JWT Validation:**
- Verify signature with secret
- Check expiration
- Validate claims

✅ **Role Verification:**
- Check Discord role on every admin action
- Cache role checks in Redis (5 min TTL)
- Fallback to fresh check if cache miss

✅ **CORS:**
- Only allow `https://admin.yourdomain.com` (or localhost in dev)
- Credentials: include (for cookies)

✅ **CSRF Protection:**
- Token-based for form submissions
- Synchronizer pattern not needed (JWT + CORS sufficient)

✅ **Rate Limiting:**
- 100 requests/minute per user globally
- 10 requests/minute per sensitive endpoint (delete, reset)

✅ **Audit Logging:**
- Every action logged to `admin_logs` table
- What: action type, target, old value, new value
- Who: admin user_id
- When: timestamp
- Cannot be deleted (immutable)

✅ **Secrets Management:**
- OAuth client secret: in `.env` (never exposed)
- JWT secret: in `.env` (never exposed)
- Database credentials: in `.env`
- Redis password: in `.env`

✅ **HTTPS Requirement:**
- Enforce HTTPS in production
- Use HSTS headers
- Secure flag on cookies

✅ **Input Validation:**
- All inputs validated on server
- No SQL injection possible (Drizzle ORM)
- No XSS (Svelte auto-escapes)

---

## 3. Admin Panel Pages

### Page 1: Dashboard

**Purpose:** Overview of bot health and statistics

**Components:**
- Stats cards (4):
  - Total users registered
  - XP gained today
  - Coins circulating
  - Active VIPs
- Line chart: XP/coins trends (7 days)
- Alerts section:
  - Bot offline warning
  - Recent errors
  - Pending admin actions

**Data Loading:**
- Real-time WebSocket updates (or polling every 30s)
- Charts lazy-loaded
- Stats cached in Redis (1 min)

---

### Page 2: Settings

**Purpose:** Configure bot behavior

**Fields:**
- **Channels:**
  - Level-up notification channel (dropdown, filtered to text channels)
  - VIP category channel (filtered to categories)
  - Robux redemption channel (filtered to text channels)

- **Multipliers:**
  - Base XP multiplier (0.5x to 3x)
  - Voice time multiplier (0.5x to 3x)
  - Bonus multiplier during events (0.5x to 5x)

- **Timers:**
  - Level recalculation interval (ms, min 60000, default 300000)
  - Minimum voice seconds to count (default 60)
  - Daily reward cooldown (hours)

- **Prefix:**
  - Command prefix (single char or short string)

**Behavior:**
- Save button triggers update
- Validation before submit
- Success toast notification
- If error, shows error message
- Changes reflected immediately in bot (via cache invalidation)

---

### Page 3: Manage Items (Shop)

**Purpose:** CRUD shop items

**Table Columns:**
- Name (searchable)
- Type (consumable, boost, cosmetic, vip, mystery_box)
- Price (in coins)
- Emoji
- Status (active/inactive)
- Actions (edit, delete, toggle)

**Features:**
- Add new item button
- Search + filter by type
- Pagination (20 items/page)
- Inline edit (click to edit)
- Delete with confirmation modal

**Modal: Create/Edit Item**
- Name (text, required, unique)
- Type (dropdown)
- Price (number, required, > 0)
- Emoji (text, optional)
- Description (textarea, optional)
- Active (toggle)
- Submit button

---

### Page 4: Manage Badges

**Purpose:** CRUD achievement badges

**Table Columns:**
- Name (searchable)
- Description
- Type (manual or automatic)
- Icon (emoji)
- Status (active/inactive)
- Actions (edit, delete)

**Features:**
- Add new badge button
- Filter by type
- Search by name
- Pagination

**Modal: Create/Edit Badge**
- Name (text, required)
- Description (textarea)
- Icon/emoji (text)
- Type (dropdown: "manual" = admin grants, "automatic" = earned at XP threshold)
- If automatic: XP threshold (number)
- Active (toggle)
- Submit button

---

### Page 5: Manage Users

**Purpose:** Admin user management

**Features:**
- Search by username or Discord ID
- Filter by XP range, level, VIP status
- Table with sort (by XP, level, username)
- Pagination (50 users/page)

**Table Columns:**
- Username
- Level
- XP (total)
- Coins
- VIP (status + expiration)
- Joined (date)
- Actions (view profile, edit, reset, ban)

**Actions:**
- **View Profile:** Modal showing full user stats
- **Edit:** Adjust XP, coins, VIP status directly
- **Reset:** Reset XP/coins to 0 (with confirmation)
- **Ban:** Prevent user from earning XP/coins (toggleable)

**Audit:** Every action logged with before/after values

---

### Page 6: Seasonal Events

**Purpose:** Manage limited-time events

**Table Columns:**
- Name (searchable)
- Start date
- End date
- XP multiplier
- Status (active, upcoming, ended)
- Actions (edit, delete, activate)

**Features:**
- Add new event button
- Current active event highlighted
- Timeline view (optional: visual calendar)
- Pagination

**Modal: Create/Edit Event**
- Name (text, required)
- Start date (datetime picker)
- End date (datetime picker)
- XP multiplier (1x to 5x)
- Active (toggle - can manually activate before date)
- Description (textarea, shown in bot)

**Behavior:**
- Events automatically activate when current time >= start
- Events automatically deactivate when current time >= end
- Manual activation overrides date check

---

### Page 7: VIP Tiers

**Purpose:** Manage VIP tiers and pricing

**Table Columns:**
- Tier name (Bronze, Silver, Gold, Platinum)
- XP multiplier
- Price (coins)
- Discord role ID
- Active users count
- Actions (edit)

**Features:**
- Edit tier inline (click to edit)
- View users with each tier
- Historical data (chart of VIP subscriptions over time)

**Fields:**
- Tier name (read-only, can't change)
- XP multiplier (0.5x to 5x)
- Price in coins (configurable)
- Discord role ID (required, autocomplete)
- Active toggle (can disable tier)

---

### Page 8: Logs & Auditoria

**Purpose:** Track all admin actions

**Table Columns:**
- Timestamp (sortable)
- Admin (username)
- Action (create, update, delete, reset, ban)
- Target (item name, user ID, etc)
- Change (before → after)
- Status (success, error)

**Features:**
- Filter by action type
- Filter by admin
- Date range picker
- Search target
- Export to CSV
- Pagination (100/page)

**Data Retention:** 90 days (automatic cleanup)

---

## 4. UI/UX - Neobrutalistic Design

### Color Palette

```
Primary Colors:
  Background:     #0a0a0a (almost black, main bg)
  Surface:        #1a1a1a (dark gray, cards/panels)
  Border:         #2a2a2a (darker gray, borders)
  Accent:         #8b5cf6 (vibrant purple, primary CTA)
  Accent Light:   #a78bfa (lighter purple, hover/focus)

Semantic Colors:
  Success:        #10b981 (green)
  Warning:        #f97316 (orange)
  Error:          #ef4444 (red)
  Info:           #3b82f6 (blue)

Text Colors:
  Primary:        #ffffff (pure white, headings)
  Secondary:      #d4d4d8 (light gray, body text)
  Tertiary:       #a1a1a6 (medium gray, labels)
  Muted:          #71717a (dark gray, placeholders)
```

### Design Principles

1. **Aggressive/Minimal**
   - No shadows or gradients
   - Flat design
   - High contrast borders (2-4px solid)

2. **Geometric**
   - Border-radius: 0px (sharp corners, brutal)
   - Grid-based layout
   - Perfect alignment

3. **Bold Typography**
   - Headings: Bold, uppercase or title case
   - Body: Regular weight
   - Monospace for: code, IDs, timestamps

4. **Visual Hierarchy**
   - Size: h1 (32px) → h2 (24px) → h3 (18px) → body (16px)
   - Color: Primary text → Secondary text → Muted
   - Borders: 4px (critical) → 2px (normal) → 1px (subtle)

### Component Library (Svelte)

All components built from scratch (no UI framework), styled with Svelte `<style>` blocks:

- **Button** (primary, secondary, danger, disabled states)
- **Input** (text, number, select, textarea with validation)
- **Card** (bordered container, 2px border)
- **Modal** (dialog with overlay, portal-based)
- **Table** (sortable, filterable, responsive)
- **Badge** (status tags: active, inactive, warning)
- **Alert** (info, success, warning, error)
- **Sidebar** (navigation, active state)
- **TopBar** (user info, logout, theme toggle)
- **Dropdown** (select component)
- **DatePicker** (for date range filters)
- **Tooltip** (on hover, positioned smart)

### Layout Structure

```
┌─────────────────────────────────────────┐
│  TopBar (user, logout)                  │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │   Main Content               │
│ (nav)    │   ┌────────────────────────┐ │
│          │   │ Page Title & Breadcrumb │ │
│          │   ├────────────────────────┤ │
│          │   │                        │ │
│          │   │  Cards / Tables        │ │
│          │   │  Modals on top         │ │
│          │   │                        │ │
│          │   └────────────────────────┘ │
└──────────┴──────────────────────────────┘
```

---

## 5. Data Management & Caching

### New Database Table: `bot_settings`

```sql
CREATE TABLE bot_settings (
  id SERIAL PRIMARY KEY,
  guild_id TEXT NOT NULL UNIQUE,
  level_up_channel TEXT,
  vip_category_id TEXT,
  robux_channel_id TEXT,
  prefix TEXT DEFAULT '!',
  xp_multiplier FLOAT DEFAULT 1.0,
  voice_multiplier FLOAT DEFAULT 1.0,
  event_multiplier FLOAT DEFAULT 1.0,
  level_recalc_interval_ms INT DEFAULT 300000,
  min_voice_seconds INT DEFAULT 60,
  daily_cooldown_hours INT DEFAULT 24,
  updated_at BIGINT,
  updated_by TEXT,  -- Discord user ID of admin
  PRIMARY KEY (guild_id)
);

CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,  -- 'create', 'update', 'delete', 'reset', 'ban'
  resource_type TEXT,    -- 'item', 'badge', 'user', 'event', 'vip', 'setting'
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  details TEXT,
  status TEXT DEFAULT 'success'  -- 'success' or 'error'
);
```

### Redis Caching Strategy

```
Key Pattern: bot:settings:{guild_id}
Value: JSON of bot_settings
TTL: 5 minutes

Key Pattern: discord:roles:{guild_id}:{user_id}
Value: Array of role IDs
TTL: 5 minutes

Key Pattern: admin:sessions:{jwt_token_id}
Value: User + role info
TTL: 15 minutes (matches JWT expiry)
```

### Cache Invalidation

When admin updates a setting:
1. Update `bot_settings` table
2. Delete Redis key `bot:settings:{guild_id}`
3. Log action to `admin_logs`
4. Bot detects change (next read from DB) or receives WebSocket event

---

## 6. API Endpoints

### Authentication

```
POST /auth/discord/login
  → redirect URL for Discord OAuth2

GET /auth/discord/callback?code=...
  → validates code, returns JWT + refresh token

POST /auth/refresh
  → refresh_token in cookie
  → returns new access_token

POST /auth/logout
  → clears refresh token cookie
```

### Admin Dashboard

```
GET /api/admin/dashboard
  ← { users_total, xp_today, coins_total, vips_active, chart_data }
```

### Settings

```
GET /api/admin/settings
  ← { prefix, channels, multipliers, timers, ... }

PATCH /api/admin/settings
  → { field: value, ... }
  ← updated settings
```

### Items

```
GET /api/admin/items?page=1&limit=20
  ← { items: [...], total, pages }

POST /api/admin/items
  → { name, type, price, emoji, ... }
  ← created item

PATCH /api/admin/items/:id
  → partial update
  ← updated item

DELETE /api/admin/items/:id
  ← { success: true }
```

### Badges

```
GET /api/admin/badges?page=1
POST /api/admin/badges
PATCH /api/admin/badges/:id
DELETE /api/admin/badges/:id
```

### Users

```
GET /api/admin/users?search=term&level=5-10&page=1
  ← paginated users with filters

GET /api/admin/users/:id
  ← full user profile

PATCH /api/admin/users/:id
  → { xp: 1000, coins: 500, banned: false, ... }
  ← updated user

POST /api/admin/users/:id/grant-badge
  → { badge_id: 123 }
```

### VIP Tiers

```
GET /api/admin/vips/tiers
  ← all VIP tiers with active user counts

PATCH /api/admin/vips/tiers/:name
  → { multiplier, price, role_id }
  ← updated tier
```

### Events

```
GET /api/admin/events
  ← all events with status

POST /api/admin/events
  → { name, start, end, multiplier }
  ← created event

PATCH /api/admin/events/:id
DELETE /api/admin/events/:id
```

### Logs

```
GET /api/admin/logs?action=update&date_from=...&date_to=...&page=1
  ← paginated audit logs

GET /api/admin/logs/export?format=csv
  ← CSV file download
```

---

## 7. Performance & Scalability

### Frontend Performance
- SvelteKit SPA or SSR (choose later)
- Code splitting by route
- Lazy loading for charts/heavy components
- Pagination everywhere (max 100 items/page)
- Virtual scrolling for large tables (optional)

### Backend Performance
- Drizzle ORM query optimization
- Database indexes on frequently queried columns
- Redis caching for reads (settings, roles, dashboard)
- Connection pooling (pg)
- Rate limiting per user

### Deployment
- Docker Compose locally + on server
- GitHub Actions CI/CD (tests, build, deploy)
- Health checks for all services
- Graceful shutdown (cleanup connections)

---

## 8. Security Checklist

- [ ] JWT validation on all endpoints
- [ ] Role verification cached + fallback
- [ ] CORS restrictive (only admin domain)
- [ ] HTTPS enforced in production
- [ ] Secrets in .env (never in code)
- [ ] Input validation on all endpoints
- [ ] SQL injection impossible (Drizzle ORM)
- [ ] XSS impossible (Svelte auto-escape)
- [ ] Rate limiting implemented
- [ ] Audit logs immutable + comprehensive
- [ ] Refresh token in httpOnly cookie
- [ ] Access token in memory (cleared on refresh)
- [ ] CSRF tokens for forms (if needed)
- [ ] Error messages don't leak info
- [ ] Database backups automated

---

## 9. Future Enhancements (Phase 2)

- Real-time updates via WebSocket (instead of polling)
- User analytics dashboard
- Bulk operations (import/export users)
- Custom commands builder
- Webhook integrations
- Two-factor authentication
- Role-based permissions (admin, moderator, viewer)
- Multi-guild support
- Dark/light theme toggle

---

## 10. Timeline & Phases

**Phase 1: Setup & Core**
- Convert to monorepo with Turborepo
- Create `packages/shared` + `packages/db`
- Setup `apps/api` NestJS scaffold
- Setup `apps/web` SvelteKit scaffold
- Implement Discord OAuth2 + JWT

**Phase 2: Admin Features**
- Build admin pages (dashboard, settings, items, badges, users, events, vips, logs)
- API endpoints for all features
- Svelte components library

**Phase 3: Integration & Testing**
- Connect web to API
- End-to-end testing
- Performance optimization
- Security audit

**Phase 4: Deployment**
- Docker setup for 3 apps
- CI/CD pipeline
- Documentation

---

**Document Approved By:** User  
**Last Updated:** 2026-03-28
