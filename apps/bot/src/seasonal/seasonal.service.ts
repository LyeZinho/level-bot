import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface SeasonalEvent {
  event_id: string;
  name: string;
  active: boolean;
  start_date: string;
  end_date: string;
  trigger_chance: number;
  cooldown_per_user: number;
  rewards: {
    coins?: number;
    badge_name?: string;
    items?: string[];
    xp_multiplier?: number;
  };
}

interface SeasonalEventsData {
  events: SeasonalEvent[];
}

@Injectable()
export class SeasonalService {
  private eventsData: SeasonalEventsData | null = null;
  private userCooldowns: Map<string, number> = new Map();
  private readonly eventsFilePath: string;

  constructor() {
    this.eventsFilePath = path.join(__dirname, '..', 'seasonal', 'seasonal-events.json');
    this.loadEvents();
  }

  private loadEvents(): void {
    try {
      if (!fs.existsSync(this.eventsFilePath)) {
        console.warn('⚠️ Seasonal events file not found:', this.eventsFilePath);
        this.eventsData = { events: [] };
        return;
      }
      const data = fs.readFileSync(this.eventsFilePath, 'utf-8');
      this.eventsData = JSON.parse(data);
    } catch (error) {
      console.error('❌ Error loading seasonal events:', error);
      this.eventsData = { events: [] };
    }
  }

  reloadEvents(): void {
    this.loadEvents();
  }

  getActiveEvents(): SeasonalEvent[] {
    if (!this.eventsData) this.loadEvents();
    if (!this.eventsData) return [];

    const now = Date.now();
    return this.eventsData.events.filter((event) => {
      if (!event.active) return false;

      const startDate = new Date(event.start_date).getTime();
      const endDate = new Date(event.end_date).getTime();

      return now >= startDate && now <= endDate;
    });
  }

  shouldTriggerEvent(eventId?: string, forceTrigger = false): SeasonalEvent | null {
    const activeEvents = this.getActiveEvents();

    if (activeEvents.length === 0) return null;

    const targetEvent = eventId
      ? activeEvents.find((e) => e.event_id === eventId)
      : activeEvents[Math.floor(Math.random() * activeEvents.length)];

    if (!targetEvent) return null;

    if (forceTrigger) return targetEvent;

    const roll = Math.random();
    return roll < targetEvent.trigger_chance ? targetEvent : null;
  }

  isUserOnCooldown(userId: string, eventId: string): boolean {
    const key = `${userId}-${eventId}`;
    const lastTrigger = this.userCooldowns.get(key);

    if (!lastTrigger) return false;

    if (!this.eventsData) this.loadEvents();
    if (!this.eventsData) return false;

    const event = this.eventsData.events.find((e) => e.event_id === eventId);

    if (!event || !event.cooldown_per_user) return false;

    const timePassed = Date.now() - lastTrigger;
    return timePassed < event.cooldown_per_user;
  }

  setUserCooldown(userId: string, eventId: string): void {
    const key = `${userId}-${eventId}`;
    this.userCooldowns.set(key, Date.now());
  }

  applyEventMultipliers(baseXp: number, baseCoins: number): { xp: number; coins: number } {
    const activeEvents = this.getActiveEvents();
    let xpMultiplier = 1;
    let coinMultiplier = 1;

    for (const event of activeEvents) {
      if (event.rewards.xp_multiplier) {
        xpMultiplier *= event.rewards.xp_multiplier;
      }
    }

    return {
      xp: Math.floor(baseXp * xpMultiplier),
      coins: Math.floor(baseCoins * coinMultiplier),
    };
  }

  getEventDetails(eventId: string): SeasonalEvent | null {
    if (!this.eventsData) this.loadEvents();
    if (!this.eventsData) return null;

    return this.eventsData.events.find((e) => e.event_id === eventId) || null;
  }

  getEventProgress(eventId: string): { startDate: string; endDate: string; progress: number; active: boolean } | null {
    const event = this.getEventDetails(eventId);
    if (!event) return null;

    const now = Date.now();
    const startDate = new Date(event.start_date).getTime();
    const endDate = new Date(event.end_date).getTime();

    const isActive = now >= startDate && now <= endDate;
    const totalDuration = endDate - startDate;
    const elapsed = Math.max(0, Math.min(now - startDate, totalDuration));
    const progress = Math.round((elapsed / totalDuration) * 100);

    return {
      startDate: event.start_date,
      endDate: event.end_date,
      progress,
      active: isActive,
    };
  }
}
