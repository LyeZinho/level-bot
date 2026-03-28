import { Injectable } from '@nestjs/common';

@Injectable()
export class ShopService {
  async getItems() {
    return { items: [] };
  }

  async createItem(data: Record<string, unknown>) {
    return { id: 1, ...data };
  }

  async updateItem(id: string, data: Record<string, unknown>) {
    return { id, ...data };
  }

  async deleteItem(id: string) {
    return { success: true };
  }
}
