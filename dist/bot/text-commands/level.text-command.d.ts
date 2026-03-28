import { Message } from 'discord.js';
import { LevelingService } from '../../leveling/leveling.service';
import { SvgGeneratorService } from '../../utils/svg.generator';
import { ImageService } from '../../utils/image.service';
export declare class LevelTextCommand {
    private levelingService;
    private svgGenerator;
    private imageService;
    constructor(levelingService: LevelingService, svgGenerator: SvgGeneratorService, imageService: ImageService);
    onLevel(message: Message): Promise<void>;
    onLvl(message: Message): Promise<void>;
}
//# sourceMappingURL=level.text-command.d.ts.map