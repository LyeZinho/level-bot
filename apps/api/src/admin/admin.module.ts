import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { SettingsController } from './controllers/settings.controller';
import { ShopController } from './controllers/shop.controller';
import { UsersController } from './controllers/users.controller';
import { SettingsService } from './services/settings.service';
import { ShopService } from './services/shop.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SettingsController, ShopController, UsersController],
  providers: [SettingsService, ShopService, UsersService],
})
export class AdminModule {}
