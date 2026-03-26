import { Injectable } from '@nestjs/common';
import { db } from '@/database/db';
import { items } from '@/database/schema';

@Injectable()
export class ShopRepository {
  async getAllItems() {
    return db.query.items.findMany();
  }

  async getItemById(id: number) {
    return db.query.items.findFirst({
      where: (items as any).id === id,
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
