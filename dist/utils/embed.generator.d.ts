import { EmbedBuilder } from 'discord.js';
export declare const EmbedColors: {
    PRIMARY: number;
    SUCCESS: number;
    ERROR: number;
    WARNING: number;
    INFO: number;
    GOLD: number;
    PURPLE: number;
};
export declare class EmbedGeneratorService {
    createEmbed({ title, description, color, thumbnail, footer, timestamp, fields, }: {
        title: string;
        description: string;
        color?: number;
        thumbnail?: string | null;
        footer?: string | null;
        timestamp?: boolean;
        fields?: {
            name: string;
            value: string;
            inline?: boolean;
        }[];
    }): EmbedBuilder;
    createImageEmbed({ title, description, imageUrl, color, thumbnail, footer, }: {
        title: string;
        description?: string | null;
        imageUrl: string;
        color?: number;
        thumbnail?: string | null;
        footer?: string | null;
    }): EmbedBuilder;
    createSuccessEmbed(title: string, description: string): EmbedBuilder;
    createErrorEmbed(title: string, description: string): EmbedBuilder;
    createWarningEmbed(title: string, description: string): EmbedBuilder;
    createMenu({ title, description, items, color, footer, }: {
        title: string;
        description?: string | null;
        items: {
            name: string;
            value: string;
            inline?: boolean;
        }[];
        color?: number;
        footer?: string | null;
    }): EmbedBuilder;
    createLevelEmbed(username: string, level: number, xp: number, nextLevelXp: number, rank: number, coins: number): EmbedBuilder;
    createRankingEmbed(title: string, users: any[], imageUrl?: string): EmbedBuilder;
    createShopEmbed(items: any[]): EmbedBuilder;
    createInventoryEmbed(username: string, items: any[]): EmbedBuilder;
    createVipEmbed(username: string, tier: string, expiresAt: Date, multiplier: number): EmbedBuilder;
    createRobuxRedemptionEmbed(username: string, robuxAmount: number): EmbedBuilder;
    createMissionEmbed(missionName: string, description: string, progress: number, target: number, reward: number): EmbedBuilder;
    createBadgesEmbed(username: string, badges: any[]): EmbedBuilder;
}
//# sourceMappingURL=embed.generator.d.ts.map