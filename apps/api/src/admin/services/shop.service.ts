import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import { DRIZZLE } from '../../drizzle.provider';

@Injectable()
export class ShopService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase,
  ) {}

  async getItems() {
    try {
      const items = await this.db.execute(
        sql`SELECT * FROM shop_items WHERE hidden = false ORDER BY price`
      );
      
      const itemList = Array.from(items || []);
      return { items: itemList, total: itemList.length };
    } catch (err) {
      console.error('[ShopService] Failed to get items:', err);
      return { items: [], total: 0 };
    }
  }

  async createItem(data: Record<string, unknown>) {
    try {
      const cols = Object.keys(data);
      const vals = Object.values(data);
      const result = await this.db.execute(
        sql`INSERT INTO shop_items (${sql.raw(cols.join(','))}) VALUES (${vals}) RETURNING *`
      );
      const itemList = Array.from(result || []);
      return itemList[0] || { id: 1, ...data };
    } catch (err) {
      console.error('[ShopService] Failed to create item:', err);
      return { id: 1, ...data };
    }
  }

  async updateItem(id: string, data: Record<string, unknown>) {
    try {
      const setClauses = Object.entries(data).map(([key]) => `${key} = $1`).join(', ');
      const result = await this.db.execute(
        sql`UPDATE shop_items SET ${sql.raw(setClauses)} WHERE id = ${parseInt(id)} RETURNING *`
      );
      const itemList = Array.from(result || []);
      return itemList[0] || { id, ...data };
    } catch (err) {
      console.error('[ShopService] Failed to update item:', err);
      return { id, ...data };
    }
  }

  async deleteItem(id: string) {
    try {
      await this.db.execute(
        sql`DELETE FROM shop_items WHERE id = ${parseInt(id)}`
      );
      return { success: true };
    } catch (err) {
      console.error('[ShopService] Failed to delete item:', err);
      return { success: false };
    }
  }
}
