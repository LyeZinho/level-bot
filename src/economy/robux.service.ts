import { Injectable, Inject } from '@nestjs/common';
import { Client } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { DRIZZLE } from '../database/drizzle.provider';
import { ShopService } from './shop.service';

@Injectable()
export class RobuxService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    private shopService: ShopService,
    private configService: ConfigService,
  ) {}

  async createRedemptionThread(client: Client, guildId: string, userId: string, robuxAmount: number): Promise<void> {
    const channelId = this.configService.get('ROBUX_REDEMPTION_CHANNEL_ID');
    if (!channelId) return;

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

      const user = await client.users.fetch(userId);
      const thread = await (channel as any).threads.create({
        name: `Robux Redemption - ${user.username}`,
        autoArchiveDuration: 1440,
      });

      await thread.members.add(userId);

      const embed = {
        title: `🎮 Robux Redemption`,
        description: `**User:** <@${userId}>\n**Amount:** ${robuxAmount} Robux`,
        color: 0x00ff00,
        timestamp: new Date().toISOString(),
      };

      await thread.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error creating redemption thread:', error);
    }
  }

  async handleRobuxPurchase(client: Client, guildId: string, userId: string): Promise<{ success: boolean; reason?: string }> {
    try {
      const inventory = await this.shopService.getUserInventory(userId, guildId);
      const robuxItem = inventory.find((item) => item.type === 'robux');

      if (!robuxItem) {
        return { success: false, reason: 'no_robux_found' };
      }

      const robuxAmount = parseInt(robuxItem.quantity) * 100;
      await this.createRedemptionThread(client, guildId, userId, robuxAmount);

      await this.db
        .delete(schema.userInventory)
        .where(
          and(
            eq(schema.userInventory.userId, userId),
            eq(schema.userInventory.guildId, guildId),
            eq(schema.userInventory.itemId, robuxItem.itemId),
          ),
        );

      return { success: true };
    } catch (error) {
      console.error('Error handling robux purchase:', error);
      return { success: false, reason: 'error' };
    }
  }
}
