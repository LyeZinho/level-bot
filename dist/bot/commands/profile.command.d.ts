import { SlashCommandContext } from 'necord';
import { LevelingService } from '../../leveling/leveling.service';
import { BadgesService } from '../../badges/badges.service';
import { SvgGeneratorService } from '../../utils/svg.generator';
import { ImageService } from '../../utils/image.service';
export declare class ProfileCommand {
    private levelingService;
    private badgesService;
    private svgGenerator;
    private imageService;
    constructor(levelingService: LevelingService, badgesService: BadgesService, svgGenerator: SvgGeneratorService, imageService: ImageService);
    onProfile([interaction]: SlashCommandContext): Promise<void>;
}
//# sourceMappingURL=profile.command.d.ts.map