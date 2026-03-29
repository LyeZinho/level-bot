# Admin Authentication & RBAC Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement admin user table with RBAC roles, seed default admin, JWT authentication, and role-based access control for the web dashboard.

**Architecture:** 
- Create `admin_users` table with username, password_hash, role enum (ADMIN, MODERATOR, VIEWER)
- Implement bcrypt password hashing and JWT token generation in API
- Add seed script to create default admin user (admin/admin initially - user changes on first login)
- Add `@AuthGuard()` and `@RolesGuard(['ADMIN'])` decorators to API endpoints
- Implement login endpoint that returns JWT token
- Add client-side login form in Svelte with localStorage token persistence

**Tech Stack:** bcryptjs, jsonwebtoken, @nestjs/jwt, @nestjs/passport

---

## Task 1: Create admin_users table schema

**Files:**
- Create: `apps/bot/src/database/schema/admin-users.ts`
- Modify: `apps/bot/src/database/migrate.ts` (add admin table creation and seed)

**Step 1: Create admin-users schema**

Create `/home/pedro/repo/level-bot/apps/bot/src/database/schema/admin-users.ts`:

```typescript
import { serial, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { createTable } from '../drizzle.provider';

export const roleEnum = pgEnum('admin_role', ['ADMIN', 'MODERATOR', 'VIEWER']);

export const adminUsers = createTable('admin_users', {
  id: serial('id').primaryKey(),
  username: text('username').unique().notNull(),
  password_hash: text('password_hash').notNull(),
  role: roleEnum('role').default('VIEWER').notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type AdminUserInsert = typeof adminUsers.$inferInsert;
```

**Step 2: Update schema index**

Modify `/home/pedro/repo/level-bot/apps/bot/src/database/schema/index.ts` to include:

```typescript
export * from './admin-users';
```

**Step 3: Add admin_users table to migrate.ts**

Add this to the migrate function in `/home/pedro/repo/level-bot/apps/bot/src/database/migrate.ts` (after items table):

```typescript
    // Ensure admin_users table exists
    console.log('[migrate] Checking admin_users table...');
    await sql`
      CREATE TYPE IF NOT EXISTS admin_role AS ENUM ('ADMIN', 'MODERATOR', 'VIEWER');
    `;

    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users'
        ) THEN
          CREATE TABLE admin_users (
            id serial PRIMARY KEY,
            username text UNIQUE NOT NULL,
            password_hash text NOT NULL,
            role admin_role DEFAULT 'VIEWER' NOT NULL,
            is_active boolean DEFAULT true,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
          );
          CREATE INDEX idx_admin_users_username ON admin_users (username);
          CREATE INDEX idx_admin_users_role ON admin_users (role);
        END IF;
      END$$;
    `;
```

**Step 4: Commit**

```bash
git add apps/bot/src/database/schema/admin-users.ts
git add apps/bot/src/database/schema/index.ts
git add apps/bot/src/database/migrate.ts
git commit -m "feat(db): add admin_users table schema with RBAC roles"
```

---

## Task 2: Add admin seed to migration

**Files:**
- Modify: `apps/bot/src/database/migrate.ts` (add seed function)

**Step 1: Add bcryptjs dependency**

```bash
cd apps/bot
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

**Step 2: Add seed function to migrate.ts**

Add at the end of migrate.ts (before `sql.end()`):

```typescript
    // Seed default admin user (only if admin_users table is empty)
    console.log('[migrate] Seeding default admin user...');
    const bcrypt = await import('bcryptjs');
    const adminCount = await sql`SELECT COUNT(*) as count FROM admin_users`;
    
    if (adminCount && adminCount[0]?.count === 0) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      await sql`
        INSERT INTO admin_users (username, password_hash, role, is_active)
        VALUES ('admin', ${hashedPassword}, 'ADMIN', true)
        ON CONFLICT (username) DO NOTHING
      `;
      console.log('[migrate] Default admin user created (username: admin, password: admin)');
    }
```

**Step 3: Commit**

```bash
git add apps/bot/package.json
git add apps/bot/src/database/migrate.ts
git commit -m "feat(db): seed default admin user with bcrypt password hashing"
```

---

## Task 3: Create API authentication service

**Files:**
- Create: `apps/api/src/auth/auth.service.ts`
- Create: `apps/api/src/auth/auth.controller.ts`
- Create: `apps/api/src/auth/auth.module.ts`
- Create: `apps/api/src/auth/jwt.strategy.ts`
- Create: `apps/api/src/auth/roles.guard.ts`

**Step 1: Create auth.service.ts**

Create `/home/pedro/repo/level-bot/apps/api/src/auth/auth.service.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DRIZZLE } from '../drizzle.provider';
import { Inject } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const sql = require('postgres');
    const result = await this.db.execute(
      sql`SELECT id, username, password_hash, role, is_active FROM admin_users WHERE username = ${username}`
    );

    if (!result || result.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = result[0];

    if (!user.is_active) {
      throw new UnauthorizedException('User is inactive');
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }

  async login(user: any) {
    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }
}
```

**Step 2: Create auth.controller.ts**

Create `/home/pedro/repo/level-bot/apps/api/src/auth/auth.controller.ts`:

```typescript
import { Controller, Post, Body, HttpCode, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { username: string; password: string }) {
    if (!body.username || !body.password) {
      throw new UnauthorizedException('Username and password required');
    }

    const user = await this.authService.validateUser(body.username, body.password);
    return this.authService.login(user);
  }
}
```

**Step 3: Create jwt.strategy.ts**

Create `/home/pedro/repo/level-bot/apps/api/src/auth/jwt.strategy.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'your-secret-key-change-in-prod',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}
```

**Step 4: Create roles.guard.ts**

Create `/home/pedro/repo/level-bot/src/auth/roles.guard.ts`:

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(`Requires one of roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
```

**Step 5: Create auth.module.ts**

Create `/home/pedro/repo/level-bot/apps/api/src/auth/auth.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { DatabaseModule } from '../database.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key-change-in-prod',
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

**Step 6: Install dependencies**

```bash
cd apps/api
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs
npm install --save-dev @types/passport-jwt
```

**Step 7: Commit**

```bash
git add apps/api/src/auth/
git add apps/api/package.json
git commit -m "feat(api): add JWT authentication service with RBAC support"
```

---

## Task 4: Add auth module to API app.module.ts

**Files:**
- Modify: `apps/api/src/app.module.ts`

**Step 1: Import AuthModule**

Update `apps/api/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { DatabaseModule } from './database.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    AuthModule,  // Add this
    AdminModule,
  ],
})
export class AppModule {}
```

**Step 2: Commit**

```bash
git add apps/api/src/app.module.ts
git commit -m "feat(api): import AuthModule in AppModule"
```

---

## Task 5: Update ShopService with auth guard

**Files:**
- Modify: `apps/api/src/admin/services/shop.service.ts`
- Modify: `apps/api/src/admin/controllers/shop.controller.ts`

**Step 1: Add auth guards to controller**

Update `apps/api/src/admin/controllers/shop.controller.ts`:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ShopService } from '../services/shop.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class ShopController {
  constructor(private shopService: ShopService) {}

  @Get('shop')
  async getShop() {
    return this.shopService.getItems();
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/admin/
git commit -m "feat(api): add JWT auth guard to admin endpoints"
```

---

## Task 6: Create web login component

**Files:**
- Create: `apps/web/src/Login.svelte`
- Modify: `apps/web/src/App.svelte`
- Modify: `apps/web/src/main.js`

**Step 1: Create Login.svelte component**

Create `/home/pedro/repo/level-bot/apps/web/src/Login.svelte`:

```svelte
<script>
  import { onMount } from 'svelte';

  let username = '';
  let password = '';
  let error = '';
  let loading = false;

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  onMount(() => {
    // Check if already logged in
    const token = localStorage.getItem('admin_token');
    if (token) {
      window.location.hash = '#dashboard';
    }
  });

  async function handleLogin(e) {
    e.preventDefault();
    error = '';
    loading = true;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        error = 'Invalid credentials';
        loading = false;
        return;
      }

      const data = await res.json();
      localStorage.setItem('admin_token', data.access_token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      window.location.hash = '#dashboard';
    } catch (err) {
      error = 'Connection error. Check API server.';
      loading = false;
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    username = '';
    password = '';
    window.location.hash = '#login';
  }

  return (
    <div class="login-container">
      <div class="login-box">
        <h1>Admin Panel</h1>
        <form on:submit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            bind:value={username}
            disabled={loading}
            required
          />
          <input
            type="password"
            placeholder="Password"
            bind:value={password}
            disabled={loading}
            required
          />
          {#if error}
            <div class="error">{error}</div>
          {/if}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
</script>

<style>
  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .login-box {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 400px;
  }

  h1 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  button {
    padding: 0.75rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s;
  }

  button:hover:not(:disabled) {
    background: #764ba2;
  }

  button:disabled {
    background: #999;
    cursor: not-allowed;
  }

  .error {
    color: #d32f2f;
    font-size: 0.9rem;
    padding: 0.5rem;
    background: #ffebee;
    border-radius: 4px;
  }
</style>
```

**Step 2: Update App.svelte to use Login component**

Update `/home/pedro/repo/level-bot/apps/web/src/App.svelte`:

```svelte
<script>
  import { onMount } from 'svelte';
  import Login from './Login.svelte';

  let isLoggedIn = false;
  let currentPage = 'login';
  let items = [];
  let loading = false;
  let error = '';

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  onMount(() => {
    checkAuth();
    window.addEventListener('hashchange', handleHashChange);
  });

  function checkAuth() {
    const token = localStorage.getItem('admin_token');
    if (token) {
      isLoggedIn = true;
      currentPage = 'dashboard';
      loadShop();
    } else {
      isLoggedIn = false;
      currentPage = 'login';
    }
  }

  function handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (hash === 'logout') {
      logout();
    }
  }

  async function loadShop() {
    loading = true;
    error = '';
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/admin/shop`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await res.json();
      items = data.items || [];
    } catch (err) {
      error = 'Failed to load shop items';
    }
    loading = false;
  }

  function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    isLoggedIn = false;
    currentPage = 'login';
    items = [];
  }
</script>

{#if currentPage === 'login'}
  <Login />
{:else if currentPage === 'dashboard' && isLoggedIn}
  <div class="dashboard">
    <header>
      <h1>Admin Panel - Shop Management</h1>
      <button on:click={logout}>Logout</button>
    </header>

    <main>
      {#if error}
        <div class="error">{error}</div>
      {/if}

      {#if loading}
        <div class="loading">Loading shop items...</div>
      {:else if items.length === 0}
        <div class="empty">Shop is empty</div>
      {:else}
        <div class="items-grid">
          {#each items as item (item.item_id)}
            <div class="item-card">
              <div class="emoji">{item.emoji}</div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div class="price">{item.price} coins</div>
              <div class="type">{item.type}</div>
            </div>
          {/each}
        </div>
      {/if}
    </main>
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .dashboard {
    min-height: 100vh;
    background: #f5f5f5;
  }

  header {
    background: #333;
    color: white;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  header h1 {
    margin: 0;
  }

  header button {
    padding: 0.5rem 1rem;
    background: #d32f2f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  header button:hover {
    background: #b71c1c;
  }

  main {
    padding: 2rem;
  }

  .error {
    background: #ffebee;
    color: #d32f2f;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .loading,
  .empty {
    text-align: center;
    padding: 2rem;
    color: #666;
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .item-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .emoji {
    font-size: 3rem;
    text-align: center;
    margin-bottom: 1rem;
  }

  .item-card h3 {
    margin: 0.5rem 0;
    color: #333;
  }

  .item-card p {
    margin: 0.5rem 0;
    color: #666;
    font-size: 0.9rem;
  }

  .price {
    font-weight: bold;
    color: #667eea;
    font-size: 1.25rem;
    margin: 0.5rem 0;
  }

  .type {
    display: inline-block;
    background: #e0e0e0;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    color: #666;
  }
</style>
```

**Step 3: Add VITE_API_URL to .env**

Update `/home/pedro/repo/level-bot/apps/web/.env.example`:

```
VITE_API_URL=http://localhost:3001
```

**Step 4: Commit**

```bash
git add apps/web/src/
git add apps/web/.env.example
git commit -m "feat(web): add login component and authenticated dashboard"
```

---

## Task 7: Update web and api build configs

**Files:**
- Modify: `apps/web/vite.config.mjs`

**Step 1: Ensure VITE_API_URL is properly configured**

Update `/home/pedro/repo/level-bot/apps/web/vite.config.mjs` to include:

```javascript
export default defineConfig({
  plugins: [svelte()],
  server: {
    allowedHosts: ['localhost', '127.0.0.1', 'crowbot.devscafe.org', 'api'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'http://localhost:3001'
    ),
  },
});
```

**Step 2: Commit**

```bash
git add apps/web/vite.config.mjs
git commit -m "fix(web): configure API proxy and environment variable"
```

---

## Task 8: Create admin users management endpoint

**Files:**
- Create: `apps/api/src/admin/controllers/users.controller.ts`
- Create: `apps/api/src/admin/services/users.service.ts`
- Modify: `apps/api/src/admin/admin.module.ts`

**Step 1: Create users.service.ts**

Create `/home/pedro/repo/level-bot/apps/api/src/admin/services/users.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DRIZZLE } from '../../drizzle.provider';
import { Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async listUsers() {
    const result = await this.db.execute(
      sql`SELECT id, username, role, is_active, created_at FROM admin_users ORDER BY created_at DESC`
    );
    return { users: Array.from(result || []), total: result?.length || 0 };
  }

  async createUser(username: string, password: string, role: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await this.db.execute(
      sql`INSERT INTO admin_users (username, password_hash, role, is_active) VALUES (${username}, ${hashedPassword}, ${role}, true) RETURNING id, username, role, is_active`
    );
    return result?.[0];
  }

  async updateUser(id: number, updates: { role?: string; is_active?: boolean }) {
    let query = 'UPDATE admin_users SET ';
    const parts = [];
    if (updates.role) parts.push(`role = '${updates.role}'`);
    if (updates.is_active !== undefined) parts.push(`is_active = ${updates.is_active}`);
    query += parts.join(', ') + ` WHERE id = ${id} RETURNING id, username, role, is_active`;

    const result = await this.db.execute(sql.raw(query));
    return result?.[0];
  }

  async deleteUser(id: number) {
    await this.db.execute(sql`DELETE FROM admin_users WHERE id = ${id}`);
  }

  async changePassword(id: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.db.execute(
      sql`UPDATE admin_users SET password_hash = ${hashedPassword} WHERE id = ${id}`
    );
  }
}
```

**Step 2: Create users.controller.ts**

Create `/home/pedro/repo/level-bot/apps/api/src/admin/controllers/users.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  Body,
  Param,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../services/users.service';
import { Reflector } from '@nestjs/core';

@Controller('admin/users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    private usersService: UsersService,
    private reflector: Reflector,
  ) {}

  @Get()
  async listUsers(@Request() req: any) {
    // Only ADMIN can list users
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can list users');
    }
    return this.usersService.listUsers();
  }

  @Post()
  async createUser(
    @Request() req: any,
    @Body() body: { username: string; password: string; role: string },
  ) {
    // Only ADMIN can create users
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create users');
    }
    return this.usersService.createUser(body.username, body.password, body.role);
  }

  @Patch(':id')
  async updateUser(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { role?: string; is_active?: boolean },
  ) {
    // Only ADMIN can update users
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update users');
    }
    return this.usersService.updateUser(Number(id), body);
  }

  @Delete(':id')
  async deleteUser(@Request() req: any, @Param('id') id: string) {
    // Only ADMIN can delete users
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete users');
    }
    if (Number(id) === req.user.userId) {
      throw new ForbiddenException('Cannot delete your own account');
    }
    await this.usersService.deleteUser(Number(id));
    return { success: true };
  }

  @Post(':id/change-password')
  async changePassword(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { password: string },
  ) {
    // Users can change their own password, admins can change anyone's
    if (req.user.role !== 'ADMIN' && req.user.userId !== Number(id)) {
      throw new ForbiddenException('Cannot change other users passwords');
    }
    await this.usersService.changePassword(Number(id), body.password);
    return { success: true };
  }
}
```

**Step 3: Update admin.module.ts**

Update `/home/pedro/repo/level-bot/apps/api/src/admin/admin.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ShopController } from './controllers/shop.controller';
import { ShopService } from './services/shop.service';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { DatabaseModule } from '../database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ShopController, UsersController],
  providers: [ShopService, UsersService],
})
export class AdminModule {}
```

**Step 4: Commit**

```bash
git add apps/api/src/admin/
git commit -m "feat(api): add admin users management with RBAC endpoints"
```

---

## Task 9: Final build and verification

**Files:**
- No files to modify

**Step 1: Build all packages**

```bash
cd /home/pedro/repo/level-bot
npm run build
```

Expected: All packages build without errors.

**Step 2: Run lsp diagnostics**

```bash
# Check TS errors in bot
npm run lint -- apps/bot/src

# Check TS errors in api
npm run lint -- apps/api/src

# Check TS errors in web
npm run lint -- apps/web/src
```

Expected: No errors.

**Step 3: Commit and push**

```bash
git log --oneline -10  # Verify commits
git status  # Should be clean
git push origin master
```

Expected: All commits pushed to origin/master successfully.

---

## Summary

**What this plan builds:**

1. ✅ New `admin_users` table with RBAC roles (ADMIN, MODERATOR, VIEWER)
2. ✅ Default admin user seeded (username: admin, password: admin)
3. ✅ JWT authentication service in API
4. ✅ Login endpoint at `POST /auth/login`
5. ✅ Protected admin endpoints with role-based guards
6. ✅ Admin user management endpoints (list, create, update, delete, change password)
7. ✅ Login UI component in Svelte
8. ✅ Authenticated dashboard with localStorage token persistence

**Key files:**
- `apps/bot/src/database/schema/admin-users.ts` — Schema definition
- `apps/api/src/auth/` — JWT authentication
- `apps/api/src/admin/` — Admin endpoints and services
- `apps/web/src/Login.svelte` — Login form
- `apps/web/src/App.svelte` — Protected dashboard

**Estimated time:** 1-2 hours for full implementation + testing

**Next:** Proceed with execution or ask for clarifications.
