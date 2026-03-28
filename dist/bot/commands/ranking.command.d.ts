import { SlashCommandContext } from 'necord';
import { LevelingService } from '../../leveling/leveling.service';
import { SvgGeneratorService } from '../../utils/svg.generator';
import { ImageService } from '../../utils/image.service';
export declare class RankingCommand {
    private levelingService;
    private svgGenerator;
    private imageService;
    constructor(levelingService: LevelingService, svgGenerator: SvgGeneratorService, imageService: ImageService);
    onRanking([interaction]: SlashCommandContext): Promise<void>;
}
//# sourceMappingURL=ranking.command.d.ts.map