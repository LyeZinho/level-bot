import { SlashCommandContext } from 'necord';
import { ShopService } from '../../economy/shop.service';
import { EmbedGeneratorService } from '../../utils/embed.generator';
export declare class BuyCommand {
    private shopService;
    private embedGenerator;
    constructor(shopService: ShopService, embedGenerator: EmbedGeneratorService);
    onBuy([interaction]: SlashCommandContext): Promise<void>;
}
//# sourceMappingURL=buy.command.d.ts.map