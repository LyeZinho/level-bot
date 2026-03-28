import { Injectable } from '@nestjs/common';

@Injectable()
export class SettingsService {
  async getSettings() {
    return {
      id: 1,
      guildId: process.env.GUILD_ID || '',
      xpPerMessageMin: 15,
      xpPerMessageMax: 25,
      notificationsEnabled: true,
      levelUpChannelId: '',
      recalculationIntervalMs: 300000,
    };
  }

  async updateSettings(data: Record<string, unknown>) {
    return { ...data, updatedAt: new Date() };
  }
}

