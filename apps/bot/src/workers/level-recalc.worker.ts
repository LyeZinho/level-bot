import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LevelingService } from '../leveling/leveling.service';

@Injectable()
export class LevelRecalcWorker {
  private readonly logger = new Logger(LevelRecalcWorker.name);

  constructor(private levelingService: LevelingService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleLevelRecalculation(): Promise<void> {
    try {
      this.logger.debug('Starting level recalculation...');
      await this.levelingService.recalculateAllLevels();
      this.logger.debug('Level recalculation completed');
    } catch (error) {
      this.logger.error('Error during level recalculation:', error);
    }
  }
}
