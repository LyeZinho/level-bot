import { Message } from 'discord.js';
import { LevelingService } from '../../leveling/leveling.service';
import { ConfigService } from '@nestjs/config';
export declare class MessageCreateListener {
    private levelingService;
    private configService;
    constructor(levelingService: LevelingService, configService: ConfigService);
    onMessageCreate([message]: [Message]): Promise<void>;
}
//# sourceMappingURL=message-create.listener.d.ts.map