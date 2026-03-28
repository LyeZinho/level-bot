import { Module } from '@nestjs/common';
import { EconomyService } from './economy.service';
import { ShopService } from './shop.service';
import { RobuxService } from './robux.service';

@Module({
  providers: [EconomyService, ShopService, RobuxService],
  exports: [EconomyService, ShopService, RobuxService],
})
export class EconomyModule {}
