import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { MissionsService } from './missions.service';

@Module({
  providers: [BadgesService, MissionsService],
  exports: [BadgesService, MissionsService],
})
export class BadgesModule {}
