"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeasonalService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let SeasonalService = class SeasonalService {
    constructor() {
        this.eventsData = null;
        this.userCooldowns = new Map();
        this.eventsFilePath = path.join(__dirname, '..', 'seasonal', 'seasonal-events.json');
        this.loadEvents();
    }
    loadEvents() {
        try {
            if (!fs.existsSync(this.eventsFilePath)) {
                console.warn('⚠️ Seasonal events file not found:', this.eventsFilePath);
                this.eventsData = { events: [] };
                return;
            }
            const data = fs.readFileSync(this.eventsFilePath, 'utf-8');
            this.eventsData = JSON.parse(data);
        }
        catch (error) {
            console.error('❌ Error loading seasonal events:', error);
            this.eventsData = { events: [] };
        }
    }
    reloadEvents() {
        this.loadEvents();
    }
    getActiveEvents() {
        if (!this.eventsData)
            this.loadEvents();
        if (!this.eventsData)
            return [];
        const now = Date.now();
        return this.eventsData.events.filter((event) => {
            if (!event.active)
                return false;
            const startDate = new Date(event.start_date).getTime();
            const endDate = new Date(event.end_date).getTime();
            return now >= startDate && now <= endDate;
        });
    }
    shouldTriggerEvent(eventId, forceTrigger = false) {
        const activeEvents = this.getActiveEvents();
        if (activeEvents.length === 0)
            return null;
        const targetEvent = eventId
            ? activeEvents.find((e) => e.event_id === eventId)
            : activeEvents[Math.floor(Math.random() * activeEvents.length)];
        if (!targetEvent)
            return null;
        if (forceTrigger)
            return targetEvent;
        const roll = Math.random();
        return roll < targetEvent.trigger_chance ? targetEvent : null;
    }
    isUserOnCooldown(userId, eventId) {
        const key = `${userId}-${eventId}`;
        const lastTrigger = this.userCooldowns.get(key);
        if (!lastTrigger)
            return false;
        if (!this.eventsData)
            this.loadEvents();
        if (!this.eventsData)
            return false;
        const event = this.eventsData.events.find((e) => e.event_id === eventId);
        if (!event || !event.cooldown_per_user)
            return false;
        const timePassed = Date.now() - lastTrigger;
        return timePassed < event.cooldown_per_user;
    }
    setUserCooldown(userId, eventId) {
        const key = `${userId}-${eventId}`;
        this.userCooldowns.set(key, Date.now());
    }
    applyEventMultipliers(baseXp, baseCoins) {
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
    getEventDetails(eventId) {
        if (!this.eventsData)
            this.loadEvents();
        if (!this.eventsData)
            return null;
        return this.eventsData.events.find((e) => e.event_id === eventId) || null;
    }
    getEventProgress(eventId) {
        const event = this.getEventDetails(eventId);
        if (!event)
            return null;
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
};
exports.SeasonalService = SeasonalService;
exports.SeasonalService = SeasonalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SeasonalService);
//# sourceMappingURL=seasonal.service.js.map