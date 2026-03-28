import { SlashCommandContext } from 'necord';
import { EconomyService } from '../../economy/economy.service';
import { EmbedGeneratorService } from '../../utils/embed.generator';
export declare class DailyCommand {
    private economyService;
    private embedGenerator;
    constructor(economyService: EconomyService, embedGenerator: EmbedGeneratorService);
    onDaily([interaction]: SlashCommandContext): Promise<void>;
}
//# sourceMappingURL=daily.command.d.ts.map