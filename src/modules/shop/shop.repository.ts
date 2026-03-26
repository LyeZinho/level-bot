import { Injectable } from '@nestjs/common';
import { db } from '@/database/db';
import { items } from '@/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ShopRepository {
  async getAllItems() {
    return db.query.items.findMany();
  }

  async getItemById(id: number) {
    return db.query.items.findFirst({
      where: eq(items.id, id),
    });
  }

  async createItem(name: string, description: string, price: number, emoji: string, type: string) {
    const [item] = await db
      .insert(items)
      .values({
        name,
        description,
        price,
        emoji,
        type,
      })
      .returning();

    return item;
  }
}
