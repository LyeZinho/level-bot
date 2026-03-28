import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VipService } from '../vip/vip.service';

@Injectable()
export class VipExpirationWorker {
  private readonly logger = new Logger(VipExpirationWorker.name);

  constructor(private vipService: VipService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleVipExpiration(): Promise<void> {
    try {
      this.logger.debug('Starting VIP expiration cleanup...');
      
      const expiredVips = await this.vipService.getExpiredVips();
      
      for (const vip of expiredVips) {
        await this.vipService.deactivateVip(vip.userId, vip.guildId);
      }

      this.logger.debug(`Deactivated ${expiredVips.length} expired VIPs`);
    } catch (error) {
      this.logger.error('Error during VIP expiration cleanup:', error);
    }
  }
}
