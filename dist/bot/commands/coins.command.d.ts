import { SlashCommandContext } from 'necord';
import { EconomyService } from '../../economy/economy.service';
import { EmbedGeneratorService } from '../../utils/embed.generator';
export declare class CoinsCommand {
    private economyService;
    private embedGenerator;
    constructor(economyService: EconomyService, embedGenerator: EmbedGeneratorService);
    onCoins([interaction]: SlashCommandContext): Promise<void>;
}
//# sourceMappingURL=coins.command.d.ts.map