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
export declare class SeasonalService {
    private eventsData;
    private userCooldowns;
    private readonly eventsFilePath;
    constructor();
    private loadEvents;
    reloadEvents(): void;
    getActiveEvents(): SeasonalEvent[];
    shouldTriggerEvent(eventId?: string, forceTrigger?: boolean): SeasonalEvent | null;
    isUserOnCooldown(userId: string, eventId: string): boolean;
    setUserCooldown(userId: string, eventId: string): void;
    applyEventMultipliers(baseXp: number, baseCoins: number): {
        xp: number;
        coins: number;
    };
    getEventDetails(eventId: string): SeasonalEvent | null;
    getEventProgress(eventId: string): {
        startDate: string;
        endDate: string;
        progress: number;
        active: boolean;
    } | null;
}
export {};
//# sourceMappingURL=seasonal.service.d.ts.map