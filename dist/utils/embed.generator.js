"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbedGeneratorService = exports.EmbedColors = void 0;
const common_1 = require("@nestjs/common");
const discord_js_1 = require("discord.js");
exports.EmbedColors = {
    PRIMARY: 0x667eea,
    SUCCESS: 0x00ff00,
    ERROR: 0xff0000,
    WARNING: 0xffa500,
    INFO: 0x3498db,
    GOLD: 0xffd700,
    PURPLE: 0x9b59b6,
};
let EmbedGeneratorService = class EmbedGeneratorService {
    createEmbed({ title, description, color = exports.EmbedColors.PRIMARY, thumbnail = null, footer = null, timestamp = true, fields = [], }) {
        const embed = new discord_js_1.EmbedBuilder().setColor(color).setTitle(title).setDescription(description);
        if (thumbnail)
            embed.setThumbnail(thumbnail);
        if (footer)
            embed.setFooter({ text: footer });
        if (timestamp)
            embed.setTimestamp();
        if (fields.length > 0)
            embed.addFields(fields);
        return embed;
    }
    createImageEmbed({ title, description = null, imageUrl, color = exports.EmbedColors.PRIMARY, thumbnail = null, footer = null, }) {
        const embed = new discord_js_1.EmbedBuilder().setColor(color).setTitle(title).setImage(imageUrl);
        if (description)
            embed.setDescription(description);
        if (thumbnail)
            embed.setThumbnail(thumbnail);
        if (footer)
            embed.setFooter({ text: footer });
        embed.setTimestamp();
        return embed;
    }
    createSuccessEmbed(title, description) {
        return this.createEmbed({
            title: `✅ ${title}`,
            description,
            color: exports.EmbedColors.SUCCESS,
        });
    }
    createErrorEmbed(title, description) {
        return this.createEmbed({
            title: `❌ ${title}`,
            description,
            color: exports.EmbedColors.ERROR,
        });
    }
    createWarningEmbed(title, description) {
        return this.createEmbed({
            title: `⚠️ ${title}`,
            description,
            color: exports.EmbedColors.WARNING,
        });
    }
    createMenu({ title, description = null, items, color = exports.EmbedColors.PRIMARY, footer = null, }) {
        const embed = new discord_js_1.EmbedBuilder().setColor(color).setTitle(title);
        if (description)
            embed.setDescription(description);
        if (items.length > 0)
            embed.addFields(items);
        if (footer)
            embed.setFooter({ text: footer });
        embed.setTimestamp();
        return embed;
    }
    createLevelEmbed(username, level, xp, nextLevelXp, rank, coins) {
        const progress = Math.round(((xp % nextLevelXp) / nextLevelXp) * 100);
        return this.createEmbed({
            title: `📊 ${username}'s Level`,
            description: `**Level:** ${level}\n**Rank:** #${rank}\n**Progress:** ${progress}%`,
            color: exports.EmbedColors.GOLD,
            fields: [
                { name: 'XP', value: `${xp}`, inline: true },
                { name: 'Coins', value: `${coins}`, inline: true },
            ],
        });
    }
    createRankingEmbed(title, users, imageUrl) {
        const fields = users.map((user, index) => ({
            name: `#${index + 1} - ${user.username}`,
            value: `Level ${user.level} | ${user.xp} XP`,
            inline: false,
        }));
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(exports.EmbedColors.PRIMARY)
            .setTitle(title)
            .addFields(fields);
        if (imageUrl)
            embed.setImage(imageUrl);
        embed.setTimestamp();
        return embed;
    }
    createShopEmbed(items) {
        const fields = items.map((item) => ({
            name: `${item.emoji} ${item.name}`,
            value: `**Price:** ${item.price} coins\n${item.description || 'No description'}`,
            inline: false,
        }));
        return this.createEmbed({
            title: '🏪 Shop',
            description: 'Check out our latest items!',
            color: exports.EmbedColors.PRIMARY,
            fields,
        });
    }
    createInventoryEmbed(username, items) {
        const fields = items.map((item) => ({
            name: `${item.emoji} ${item.name}`,
            value: `**Quantity:** ${item.quantity}`,
            inline: true,
        }));
        return this.createEmbed({
            title: `📦 ${username}'s Inventory`,
            description: `Total items: ${items.length}`,
            color: exports.EmbedColors.PRIMARY,
            fields,
        });
    }
    createVipEmbed(username, tier, expiresAt, multiplier) {
        return this.createEmbed({
            title: `👑 VIP Status`,
            description: `**User:** ${username}\n**Tier:** ${tier.toUpperCase()}\n**Multiplier:** ${multiplier}x`,
            color: exports.EmbedColors.GOLD,
            fields: [
                { name: 'Expires at', value: expiresAt.toUTCString(), inline: false },
            ],
        });
    }
    createRobuxRedemptionEmbed(username, robuxAmount) {
        return this.createEmbed({
            title: '🎮 Robux Redemption',
            description: `**User:** ${username}\n**Amount:** ${robuxAmount} Robux\n\nA staff member will contact you shortly to verify and process your redemption.`,
            color: exports.EmbedColors.SUCCESS,
        });
    }
    createMissionEmbed(missionName, description, progress, target, reward) {
        const progressPercent = Math.round((progress / target) * 100);
        return this.createEmbed({
            title: `🎯 ${missionName}`,
            description,
            color: exports.EmbedColors.INFO,
            fields: [
                { name: 'Progress', value: `${progress}/${target} (${progressPercent}%)`, inline: true },
                { name: 'Reward', value: `${reward} coins`, inline: true },
            ],
        });
    }
    createBadgesEmbed(username, badges) {
        const fields = badges.map((badge) => ({
            name: badge.name,
            value: `**Type:** ${badge.badgeType}\n**Tier:** ${badge.tier || 'N/A'}`,
            inline: true,
        }));
        return this.createEmbed({
            title: `🏅 ${username}'s Badges`,
            description: `Total: ${badges.length}`,
            color: exports.EmbedColors.PURPLE,
            fields,
        });
    }
};
exports.EmbedGeneratorService = EmbedGeneratorService;
exports.EmbedGeneratorService = EmbedGeneratorService = __decorate([
    (0, common_1.Injectable)()
], EmbedGeneratorService);
//# sourceMappingURL=embed.generator.js.map