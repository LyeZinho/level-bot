import { Module } from '@nestjs/common';
import { SeasonalService } from './seasonal.service';

@Module({
  providers: [SeasonalService],
  exports: [SeasonalService],
})
export class SeasonalModule {}
