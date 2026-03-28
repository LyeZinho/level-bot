import { Injectable } from '@nestjs/common';
import { EmbedBuilder } from 'discord.js';

export const EmbedColors = {
  PRIMARY: 0x667eea,
  SUCCESS: 0x00ff00,
  ERROR: 0xff0000,
  WARNING: 0xffa500,
  INFO: 0x3498db,
  GOLD: 0xffd700,
  PURPLE: 0x9b59b6,
};

@Injectable()
export class EmbedGeneratorService {
  createEmbed({
    title,
    description,
    color = EmbedColors.PRIMARY,
    thumbnail = null,
    footer = null,
    timestamp = true,
    fields = [],
  }: {
    title: string;
    description: string;
    color?: number;
    thumbnail?: string | null;
    footer?: string | null;
    timestamp?: boolean;
    fields?: { name: string; value: string; inline?: boolean }[];
  }): EmbedBuilder {
    const embed = new EmbedBuilder().setColor(color).setTitle(title).setDescription(description);

    if (thumbnail) embed.setThumbnail(thumbnail);
    if (footer) embed.setFooter({ text: footer });
    if (timestamp) embed.setTimestamp();
    if (fields.length > 0) embed.addFields(fields);

    return embed;
  }

  createImageEmbed({
    title,
    description = null,
    imageUrl,
    color = EmbedColors.PRIMARY,
    thumbnail = null,
    footer = null,
  }: {
    title: string;
    description?: string | null;
    imageUrl: string;
    color?: number;
    thumbnail?: string | null;
    footer?: string | null;
  }): EmbedBuilder {
    const embed = new EmbedBuilder().setColor(color).setTitle(title).setImage(imageUrl);

    if (description) embed.setDescription(description);
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (footer) embed.setFooter({ text: footer });
    embed.setTimestamp();

    return embed;
  }

  createSuccessEmbed(title: string, description: string): EmbedBuilder {
    return this.createEmbed({
      title: `✅ ${title}`,
      description,
      color: EmbedColors.SUCCESS,
    });
  }

  createErrorEmbed(title: string, description: string): EmbedBuilder {
    return this.createEmbed({
      title: `❌ ${title}`,
      description,
      color: EmbedColors.ERROR,
    });
  }

  createWarningEmbed(title: string, description: string): EmbedBuilder {
    return this.createEmbed({
      title: `⚠️ ${title}`,
      description,
      color: EmbedColors.WARNING,
    });
  }

  createMenu({
    title,
    description = null,
    items,
    color = EmbedColors.PRIMARY,
    footer = null,
  }: {
    title: string;
    description?: string | null;
    items: { name: string; value: string; inline?: boolean }[];
    color?: number;
    footer?: string | null;
  }): EmbedBuilder {
    const embed = new EmbedBuilder().setColor(color).setTitle(title);

    if (description) embed.setDescription(description);
    if (items.length > 0) embed.addFields(items);
    if (footer) embed.setFooter({ text: footer });
    embed.setTimestamp();

    return embed;
  }

  createLevelEmbed(
    username: string,
    level: number,
    xp: number,
    nextLevelXp: number,
    rank: number,
    coins: number,
  ): EmbedBuilder {
    const progress = Math.round(((xp % nextLevelXp) / nextLevelXp) * 100);

    return this.createEmbed({
      title: `📊 ${username}'s Level`,
      description: `**Level:** ${level}\n**Rank:** #${rank}\n**Progress:** ${progress}%`,
      color: EmbedColors.GOLD,
      fields: [
        { name: 'XP', value: `${xp}`, inline: true },
        { name: 'Coins', value: `${coins}`, inline: true },
      ],
    });
  }

  createRankingEmbed(title: string, users: any[], imageUrl?: string): EmbedBuilder {
    const fields = users.map((user, index) => ({
      name: `#${index + 1} - ${user.username}`,
      value: `Level ${user.level} | ${user.xp} XP`,
      inline: false,
    }));

    const embed = new EmbedBuilder()
      .setColor(EmbedColors.PRIMARY)
      .setTitle(title)
      .addFields(fields);

    if (imageUrl) embed.setImage(imageUrl);
    embed.setTimestamp();

    return embed;
  }

  createShopEmbed(items: any[]): EmbedBuilder {
    const fields = items.map((item) => ({
      name: `${item.emoji} ${item.name}`,
      value: `**Price:** ${item.price} coins\n${item.description || 'No description'}`,
      inline: false,
    }));

    return this.createEmbed({
      title: '🏪 Shop',
      description: 'Check out our latest items!',
      color: EmbedColors.PRIMARY,
      fields,
    });
  }

  createInventoryEmbed(username: string, items: any[]): EmbedBuilder {
    const fields = items.map((item) => ({
      name: `${item.emoji} ${item.name}`,
      value: `**Quantity:** ${item.quantity}`,
      inline: true,
    }));

    return this.createEmbed({
      title: `📦 ${username}'s Inventory`,
      description: `Total items: ${items.length}`,
      color: EmbedColors.PRIMARY,
      fields,
    });
  }

  createVipEmbed(username: string, tier: string, expiresAt: Date, multiplier: number): EmbedBuilder {
    return this.createEmbed({
      title: `👑 VIP Status`,
      description: `**User:** ${username}\n**Tier:** ${tier.toUpperCase()}\n**Multiplier:** ${multiplier}x`,
      color: EmbedColors.GOLD,
      fields: [
        { name: 'Expires at', value: expiresAt.toUTCString(), inline: false },
      ],
    });
  }

  createRobuxRedemptionEmbed(username: string, robuxAmount: number): EmbedBuilder {
    return this.createEmbed({
      title: '🎮 Robux Redemption',
      description: `**User:** ${username}\n**Amount:** ${robuxAmount} Robux\n\nA staff member will contact you shortly to verify and process your redemption.`,
      color: EmbedColors.SUCCESS,
    });
  }

  createMissionEmbed(missionName: string, description: string, progress: number, target: number, reward: number): EmbedBuilder {
    const progressPercent = Math.round((progress / target) * 100);

    return this.createEmbed({
      title: `🎯 ${missionName}`,
      description,
      color: EmbedColors.INFO,
      fields: [
        { name: 'Progress', value: `${progress}/${target} (${progressPercent}%)`, inline: true },
        { name: 'Reward', value: `${reward} coins`, inline: true },
      ],
    });
  }

  createBadgesEmbed(username: string, badges: any[]): EmbedBuilder {
    const fields = badges.map((badge) => ({
      name: badge.name,
      value: `**Type:** ${badge.badgeType}\n**Tier:** ${badge.tier || 'N/A'}`,
      inline: true,
    }));

    return this.createEmbed({
      title: `🏅 ${username}'s Badges`,
      description: `Total: ${badges.length}`,
      color: EmbedColors.PURPLE,
      fields,
    });
  }
}
