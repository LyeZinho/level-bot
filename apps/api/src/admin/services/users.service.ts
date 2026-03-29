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
    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.role !== undefined) {
      setClauses.push(`role = $${values.length + 1}`);
      values.push(updates.role);
    }
    if (updates.is_active !== undefined) {
      setClauses.push(`is_active = $${values.length + 1}`);
      values.push(updates.is_active);
    }

    if (setClauses.length === 0) {
      const result = await this.db.execute(
        sql`SELECT id, username, role, is_active FROM admin_users WHERE id = ${id}`
      );
      return result?.[0];
    }

    const updateQuery = `UPDATE admin_users SET ${setClauses.join(', ')} WHERE id = ${id} RETURNING id, username, role, is_active`;
    const result = await this.db.execute(sql.raw(updateQuery));
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
