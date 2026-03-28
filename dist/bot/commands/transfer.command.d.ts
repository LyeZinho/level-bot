import { SlashCommandContext } from 'necord';
import { EconomyService } from '../../economy/economy.service';
import { EmbedGeneratorService } from '../../utils/embed.generator';
export declare class TransferCommand {
    private economyService;
    private embedGenerator;
    constructor(economyService: EconomyService, embedGenerator: EmbedGeneratorService);
    onTransfer([interaction]: SlashCommandContext): Promise<void>;
}
//# sourceMappingURL=transfer.command.d.ts.map