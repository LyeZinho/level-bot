import { SlashCommandContext } from 'necord';
import { ShopService } from '../../economy/shop.service';
import { EmbedGeneratorService } from '../../utils/embed.generator';
export declare class ShopCommand {
    private shopService;
    private embedGenerator;
    constructor(shopService: ShopService, embedGenerator: EmbedGeneratorService);
    onShop([interaction]: SlashCommandContext): Promise<void>;
}
//# sourceMappingURL=shop.command.d.ts.map