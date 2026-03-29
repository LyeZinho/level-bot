import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { SettingsController } from './controllers/settings.controller';
import { ShopController } from './controllers/shop.controller';
import { SettingsService } from './services/settings.service';
import { ShopService } from './services/shop.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SettingsController, ShopController],
  providers: [SettingsService, ShopService],
})
export class AdminModule {}
