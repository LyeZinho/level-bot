import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LevelingModule } from '../leveling/leveling.module';
import { VipModule } from '../vip/vip.module';
import { LevelRecalcWorker } from './level-recalc.worker';
import { VipExpirationWorker } from './vip-expiration.worker';

@Module({
  imports: [ScheduleModule.forRoot(), LevelingModule, VipModule],
  providers: [LevelRecalcWorker, VipExpirationWorker],
})
export class WorkersModule {}
