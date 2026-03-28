import { SlashCommandContext } from 'necord';
import { LevelingService } from '../../leveling/leveling.service';
import { EmbedGeneratorService } from '../../utils/embed.generator';
export declare class LevelCommand {
    private levelingService;
    private embedGenerator;
    constructor(levelingService: LevelingService, embedGenerator: EmbedGeneratorService);
    onLevel([interaction]: SlashCommandContext): Promise<void>;
}
//# sourceMappingURL=level.command.d.ts.map