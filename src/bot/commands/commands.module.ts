import { Module } from '@nestjs/common';
import { LevelingModule } from '../../leveling/leveling.module';
import { EconomyModule } from '../../economy/economy.module';
import { BadgesModule } from '../../badges/badges.module';
import { UtilsModule } from '../../utils/utils.module';
import { LevelCommand } from './level.command';
import { RankingCommand } from './ranking.command';
import { ProfileCommand } from './profile.command';
import { CoinsCommand } from './coins.command';
import { DailyCommand } from './daily.command';
import { TransferCommand } from './transfer.command';
import { ShopCommand } from './shop.command';
import { InventoryCommand } from './inventory.command';
import { BuyCommand } from './buy.command';

@Module({
  imports: [LevelingModule, EconomyModule, BadgesModule, UtilsModule],
  providers: [
    LevelCommand,
    RankingCommand,
    ProfileCommand,
    CoinsCommand,
    DailyCommand,
    TransferCommand,
    ShopCommand,
    InventoryCommand,
    BuyCommand,
  ],
})
export class CommandsModule {}
