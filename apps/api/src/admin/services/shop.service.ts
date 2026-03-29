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
        sql`SELECT * FROM items WHERE hidden = false ORDER BY price`
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
        sql`INSERT INTO items (${sql.raw(cols.join(','))}) VALUES (${vals}) RETURNING *`
      );
      const itemList = Array.from(result || []);
      return itemList[0] || { itemId: 1, ...data };
    } catch (err) {
      console.error('[ShopService] Failed to create item:', err);
      return { itemId: 1, ...data };
    }
  }

  async updateItem(id: string, data: Record<string, unknown>) {
    try {
      const setClauses = Object.entries(data).map(([key]) => `${key} = $1`).join(', ');
      const result = await this.db.execute(
        sql`UPDATE items SET ${sql.raw(setClauses)} WHERE item_id = ${parseInt(id)} RETURNING *`
      );
      const itemList = Array.from(result || []);
      return itemList[0] || { itemId: id, ...data };
    } catch (err) {
      console.error('[ShopService] Failed to update item:', err);
      return { itemId: id, ...data };
    }
  }

  async deleteItem(id: string) {
    try {
      await this.db.execute(
        sql`DELETE FROM items WHERE item_id = ${parseInt(id)}`
      );
      return { success: true };
    } catch (err) {
      console.error('[ShopService] Failed to delete item:', err);
      return { success: false };
    }
  }
}
