import { Injectable, Inject } from '@nestjs/common';
import { and, eq, lt } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { DRIZZLE } from '../database/drizzle.provider';
import { VIP_TIERS, VIPTierKey } from './vip.constants';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class VipService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    private cacheService: CacheService,
  ) {}

  async getActiveVip(userId: string, guildId: string): Promise<typeof schema.userVips.$inferSelect | null> {
    const vips = await this.db
      .select()
      .from(schema.userVips)
      .where(and(eq(schema.userVips.userId, userId), eq(schema.userVips.guildId, guildId)));

    for (const vip of vips) {
      if (new Date(vip.expiresAt) <= new Date()) {
        await this.db
          .delete(schema.userVips)
          .where(and(eq(schema.userVips.userId, userId), eq(schema.userVips.guildId, guildId), eq(schema.userVips.tier, vip.tier)));
      }
    }

    const active = await this.db
      .select()
      .from(schema.userVips)
      .where(
        and(
          eq(schema.userVips.userId, userId),
          eq(schema.userVips.guildId, guildId),
          eq(schema.userVips.active, true),
        ),
      )
      .limit(1);

    return active[0] || null;
  }

  async activateVip(userId: string, guildId: string, tier: VIPTierKey, durationDays?: number): Promise<void> {
    const tierConfig = VIP_TIERS[tier];
    const duration = durationDays || tierConfig.durationDays;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    await this.db.delete(schema.userVips).where(and(eq(schema.userVips.userId, userId), eq(schema.userVips.guildId, guildId)));

    await this.db.insert(schema.userVips).values({
      userId,
      guildId,
      tier,
      multiplier: tierConfig.multiplier,
      expiresAt,
      active: true,
    });

    await this.db.insert(schema.userBoosts).values({
      userId,
      guildId,
      boostType: `vip_${tier}`,
      multiplier: tierConfig.multiplier.toString(),
      expiresAt,
    });

    await this.cacheService.del(`multiplier:${userId}:${guildId}`);
  }

  async getExpiredVips(): Promise<typeof schema.userVips.$inferSelect[]> {
    return this.db
      .select()
      .from(schema.userVips)
      .where(lt(schema.userVips.expiresAt, new Date()));
  }

  async deactivateVip(userId: string, guildId: string): Promise<void> {
    await this.db
      .delete(schema.userVips)
      .where(and(eq(schema.userVips.userId, userId), eq(schema.userVips.guildId, guildId)));

    const boosts = await this.db
      .select()
      .from(schema.userBoosts)
      .where(
        and(
          eq(schema.userBoosts.userId, userId),
          eq(schema.userBoosts.guildId, guildId),
        ),
      );

    for (const boost of boosts) {
      if (boost.boostType.startsWith('vip_')) {
        await this.db
          .delete(schema.userBoosts)
          .where(
            and(
              eq(schema.userBoosts.userId, userId),
              eq(schema.userBoosts.guildId, guildId),
              eq(schema.userBoosts.boostType, boost.boostType),
            ),
          );
      }
    }

    await this.cacheService.del(`multiplier:${userId}:${guildId}`);
  }

  async giveVipItem(userId: string, guildId: string, tier: VIPTierKey): Promise<void> {
    const tierConfig = VIP_TIERS[tier];
    const itemName = `VIP ${tierConfig.name}`;

    const item = await this.db.select().from(schema.items).where(eq(schema.items.name, itemName)).limit(1);

    if (item.length > 0) {
      const existing = await this.db
        .select()
        .from(schema.userInventory)
        .where(
          and(
            eq(schema.userInventory.userId, userId),
            eq(schema.userInventory.guildId, guildId),
            eq(schema.userInventory.itemId, item[0].itemId),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        await this.db
          .update(schema.userInventory)
          .set({
            quantity: (parseInt(existing[0].quantity) + 1).toString(),
          })
          .where(
            and(
              eq(schema.userInventory.userId, userId),
              eq(schema.userInventory.guildId, guildId),
              eq(schema.userInventory.itemId, item[0].itemId),
            ),
          );
      } else {
        await this.db.insert(schema.userInventory).values({
          userId,
          guildId,
          itemId: item[0].itemId,
          quantity: '1',
        });
      }
    }
  }
}
