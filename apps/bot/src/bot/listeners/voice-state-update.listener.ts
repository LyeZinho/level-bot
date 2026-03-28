import { Injectable } from '@nestjs/common';
import { On, Context } from 'necord';
import { VoiceState } from 'discord.js';
import { LevelingService } from '../../leveling/leveling.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VoiceStateUpdateListener {
  private voiceTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private levelingService: LevelingService,
    private configService: ConfigService,
  ) {}

  @On('voiceStateUpdate')
  async onVoiceStateUpdate(
    @Context() [oldState, newState]: [VoiceState, VoiceState],
  ): Promise<void> {
    if (!newState.guild || !newState.member || newState.member.user.bot) {
      return;
    }

    const allowedGuildIds = this.configService.get<string>('ALLOWED_GUILD_IDS')?.split(',') || [];
    if (!allowedGuildIds.includes(newState.guild.id)) {
      return;
    }

    const minVoiceSeconds = this.configService.get<number>('MIN_VOICE_SECONDS') || 60;
    const userKey = `${newState.member.id}:${newState.guild.id}`;

    if (!oldState.channel && newState.channel) {
      const timer = setTimeout(async () => {
        try {
          const latestState = newState.member?.voice;
          if (latestState?.channel && newState.member) {
            await this.levelingService.addVoiceTime(
              newState.member.id,
              newState.member.user.username,
              newState.guild.id,
              minVoiceSeconds,
            );
          }
        } catch (error) {
          console.error('Error adding voice time:', error);
        }
        this.voiceTimers.delete(userKey);
      }, minVoiceSeconds * 1000);

      this.voiceTimers.set(userKey, timer);
    } else if (oldState.channel && !newState.channel) {
      const timer = this.voiceTimers.get(userKey);
      if (timer) {
        clearTimeout(timer);
        this.voiceTimers.delete(userKey);
      }
    }
  }
}
