import { Injectable } from '@nestjs/common';
import { ShopRepository } from './shop.repository';
import { RedisService } from '@/redis/redis.service';
import { GetShopDto } from './dto/get-shop.dto';

@Injectable()
export class ShopService {
  constructor(
    private shopRepository: ShopRepository,
    private redisService: RedisService,
  ) {}

  async getShop(dto: GetShopDto) {
    const cacheKey = `shop:${dto.guildId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const shop = await this.shopRepository.getAllItems();
    await this.redisService.set(cacheKey, shop, 3600);

    return shop;
  }

  async getItemById(id: number) {
    const cacheKey = `shop:item:${id}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const item = await this.shopRepository.getItemById(id);
    if (item) {
      await this.redisService.set(cacheKey, item, 3600);
    }

    return item;
  }
}
