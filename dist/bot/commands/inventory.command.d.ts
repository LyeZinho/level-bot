import { SlashCommandContext } from 'necord';
import { ShopService } from '../../economy/shop.service';
import { EmbedGeneratorService } from '../../utils/embed.generator';
export declare class InventoryCommand {
    private shopService;
    private embedGenerator;
    constructor(shopService: ShopService, embedGenerator: EmbedGeneratorService);
    onInventory([interaction]: SlashCommandContext): Promise<void>;
}
//# sourceMappingURL=inventory.command.d.ts.map