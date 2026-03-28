import { Message } from 'discord.js';
import { LevelingService } from '../../leveling/leveling.service';
import { SvgGeneratorService } from '../../utils/svg.generator';
import { ImageService } from '../../utils/image.service';
export declare class RankingTextCommand {
    private levelingService;
    private svgGenerator;
    private imageService;
    constructor(levelingService: LevelingService, svgGenerator: SvgGeneratorService, imageService: ImageService);
    onRanking(message: Message): Promise<void>;
    onRank(message: Message): Promise<void>;
    onTop(message: Message): Promise<void>;
}
//# sourceMappingURL=ranking.text-command.d.ts.map