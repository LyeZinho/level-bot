import { VoiceState } from 'discord.js';
import { LevelingService } from '../../leveling/leveling.service';
import { ConfigService } from '@nestjs/config';
export declare class VoiceStateUpdateListener {
    private levelingService;
    private configService;
    private voiceTimers;
    constructor(levelingService: LevelingService, configService: ConfigService);
    onVoiceStateUpdate([oldState, newState]: [VoiceState, VoiceState]): Promise<void>;
}
//# sourceMappingURL=voice-state-update.listener.d.ts.map