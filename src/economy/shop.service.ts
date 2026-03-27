import { Injectable, Inject } from '@nestjs/common';
import { and, eq, desc, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { DRIZZLE } from '../database/drizzle.provider';
import { EconomyService } from './economy.service';

@Injectable()
export class ShopService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    private economyService: EconomyService,
  ) {}

  async createItem(name: string, description: string, price: number, emoji = '📦', type = 'consumable', hidden = false): Promise<typeof schema.items.$inferSelect> {
    const existing = await this.db.select().from(schema.items).where(eq(schema.items.name, name)).limit(1);

    if (existing.length > 0) {
      await this.db
        .update(schema.items)
        .set({
          description,
          price,
          emoji,
          type,
          hidden,
        })
        .where(eq(schema.items.name, name));

      const updated = await this.db.select().from(schema.items).where(eq(schema.items.name, name)).limit(1);
      return updated[0];
    }

    const result = await this.db.insert(schema.items).values({
      name,
      description,
      price,
      emoji,
      type,
      hidden,
    }).returning();

    return result[0];
  }

  async getAllItems(): Promise<typeof schema.items.$inferSelect[]> {
    return this.db.select().from(schema.items).where(eq(schema.items.hidden, false)).orderBy(schema.items.price);
  }

  async getItem(itemId: number): Promise<typeof schema.items.$inferSelect | null> {
    const result = await this.db.select().from(schema.items).where(eq(schema.items.itemId, itemId)).limit(1);
    return result[0] || null;
  }

  async getItemByName(name: string): Promise<typeof schema.items.$inferSelect | null> {
    const result = await this.db
      .select()
      .from(schema.items)
      .where(sql`LOWER(name) = LOWER(${name})`)
      .limit(1);
    return result[0] || null;
  }

  async buyItem(userId: string, guildId: string, itemId: number, quantity = 1): Promise<{ success: boolean; reason?: string; item?: any; quantity?: number; totalCost?: number }> {
    try {
      const item = await this.getItem(itemId);
      if (!item) {
        return { success: false, reason: 'item_not_found' };
      }

      const totalCost = item.price * quantity;
      const user = await this.db
        .select()
        .from(schema.users)
        .where(and(eq(schema.users.userId, userId), eq(schema.users.guildId, guildId)))
        .limit(1);

      if (user.length === 0 || parseInt(user[0].coins) < totalCost) {
        return { success: false, reason: 'insufficient_funds', totalCost };
      }

      await this.economyService.removeCoins(userId, guildId, totalCost);

      const existing = await this.db
        .select()
        .from(schema.userInventory)
        .where(and(eq(schema.userInventory.userId, userId), eq(schema.userInventory.guildId, guildId), eq(schema.userInventory.itemId, itemId)))
        .limit(1);

      if (existing.length > 0) {
        await this.db
          .update(schema.userInventory)
          .set({
            quantity: (parseInt(existing[0].quantity) + quantity).toString(),
          })
          .where(and(eq(schema.userInventory.userId, userId), eq(schema.userInventory.guildId, guildId), eq(schema.userInventory.itemId, itemId)));
      } else {
        await this.db.insert(schema.userInventory).values({
          userId,
          guildId,
          itemId,
          quantity: quantity.toString(),
        });
      }

      return { success: true, item, quantity, totalCost };
    } catch (error) {
      throw error;
    }
  }

  async getUserInventory(userId: string, guildId: string): Promise<any[]> {
    const result = await this.db
      .select({
        id: schema.userInventory.id,
        userId: schema.userInventory.userId,
        guildId: schema.userInventory.guildId,
        itemId: schema.userInventory.itemId,
        quantity: schema.userInventory.quantity,
        acquiredAt: schema.userInventory.acquiredAt,
        name: schema.items.name,
        description: schema.items.description,
        emoji: schema.items.emoji,
        type: schema.items.type,
        price: schema.items.price,
      })
      .from(schema.userInventory)
      .innerJoin(schema.items, eq(schema.userInventory.itemId, schema.items.itemId))
      .where(and(eq(schema.userInventory.userId, userId), eq(schema.userInventory.guildId, guildId)))
      .orderBy(desc(schema.userInventory.acquiredAt));

    return result;
  }
}
