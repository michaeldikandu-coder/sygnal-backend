import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FeedsService } from '../feeds/feeds.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly feedsService: FeedsService) {}

  // Sync real-world events every hour
  @Cron(CronExpression.EVERY_HOUR)
  async syncRealWorldEvents() {
    this.logger.log('Starting scheduled sync of real-world events...');
    
    try {
      const signals = await this.feedsService.fetchAllRealWorldEvents();
      this.logger.log(`Successfully synced ${signals.length} real-world events`);
    } catch (error) {
      this.logger.error('Failed to sync real-world events:', error.message);
    }
  }

  // Sync crypto data every 30 minutes (reduced frequency)
  @Cron('0 */30 * * * *') // Every 30 minutes
  async syncCryptoEvents() {
    this.logger.log('Syncing crypto events...');
    
    try {
      const signals = await this.feedsService.fetchCryptoEvents();
      this.logger.log(`Synced ${signals.length} crypto events`);
    } catch (error) {
      this.logger.error('Failed to sync crypto events:', error.message);
    }
  }

  // Sync financial data every 30 minutes during market hours
  @Cron('0 */30 9-16 * * 1-5') // Every 30 min, 9 AM to 4 PM, Mon-Fri
  async syncFinancialEvents() {
    this.logger.log('Syncing financial events...');
    
    try {
      const signals = await this.feedsService.fetchFinancialEvents();
      this.logger.log(`Synced ${signals.length} financial events`);
    } catch (error) {
      this.logger.error('Failed to sync financial events:', error.message);
    }
  }
}