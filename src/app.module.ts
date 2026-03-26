import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from './modules/discord/discord.module';
import { LevelsModule } from './modules/levels/levels.module';
import { EconomyModule } from './modules/economy/economy.module';
import { ShopModule } from './modules/shop/shop.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { MissionsModule } from './modules/missions/missions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DiscordModule,
    LevelsModule,
    EconomyModule,
    ShopModule,
    InventoryModule,
    MissionsModule,
  ],
})
export class AppModule {}
