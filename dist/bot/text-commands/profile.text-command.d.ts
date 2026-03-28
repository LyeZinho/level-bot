import { Message } from 'discord.js';
import { LevelingService } from '../../leveling/leveling.service';
import { BadgesService } from '../../badges/badges.service';
import { SvgGeneratorService } from '../../utils/svg.generator';
import { ImageService } from '../../utils/image.service';
export declare class ProfileTextCommand {
    private levelingService;
    private badgesService;
    private svgGenerator;
    private imageService;
    constructor(levelingService: LevelingService, badgesService: BadgesService, svgGenerator: SvgGeneratorService, imageService: ImageService);
    onProfile(message: Message): Promise<void>;
    onPerfil(message: Message): Promise<void>;
    onP(message: Message): Promise<void>;
}
//# sourceMappingURL=profile.text-command.d.ts.map