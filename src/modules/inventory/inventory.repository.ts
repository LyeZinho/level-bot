import { Injectable } from '@nestjs/common';
import { db } from '@/database/db';
import { userInventory } from '@/database/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class InventoryRepository {
  async addItem(userId: number, itemId: number, quantity: number = 1) {
    const existing = await db.query.userInventory.findFirst({
      where: and(eq(userInventory.userId, userId), eq(userInventory.itemId, itemId)),
    });

    if (existing) {
      const [updated] = await db
        .update(userInventory)
        .set({
          quantity: existing.quantity + quantity,
          updatedAt: new Date(),
        })
        .where(eq(userInventory.id, existing.id))
        .returning();

      return updated;
    }

    const [newItem] = await db
      .insert(userInventory)
      .values({
        userId,
        itemId,
        quantity,
      })
      .returning();

    return newItem;
  }

  async removeItem(userId: number, itemId: number, quantity: number = 1) {
    const existing = await db.query.userInventory.findFirst({
      where: and(eq(userInventory.userId, userId), eq(userInventory.itemId, itemId)),
    });

    if (!existing) throw new Error('Item não encontrado no inventário');
    if (existing.quantity < quantity) throw new Error('Quantidade insuficiente');

    if (existing.quantity === quantity) {
      await db.delete(userInventory).where(eq(userInventory.id, existing.id));
      return null;
    }

    const [updated] = await db
      .update(userInventory)
      .set({
        quantity: existing.quantity - quantity,
        updatedAt: new Date(),
      })
      .where(eq(userInventory.id, existing.id))
      .returning();

    return updated;
  }

  async getUserInventory(userId: number) {
    return db.query.userInventory.findMany({
      where: eq(userInventory.userId, userId),
      with: {
        item: true,
      },
    });
  }

  async useItem(userId: number, itemId: number) {
    const existing = await db.query.userInventory.findFirst({
      where: and(eq(userInventory.userId, userId), eq(userInventory.itemId, itemId)),
    });

    if (!existing) throw new Error('Item não encontrado');

    const [updated] = await db
      .update(userInventory)
      .set({
        usedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userInventory.id, existing.id))
      .returning();

    return updated;
  }
}
