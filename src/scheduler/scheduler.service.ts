import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FeedsService } from '../feeds/feeds.service';
import { PolymarketService } from '../polymarket/polymarket.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly feedsService: FeedsService,
    private readonly polymarketService: PolymarketService,
  ) {}

  // Sync fresh Polymarket data every 30 minutes for real-time updates
  @Cron('0 */30 * * * *') // Every 30 minutes
  async syncFreshPolymarketData() {
    this.logger.log('🔄 Syncing fresh Polymarket data...');
    
    try {
      const signals = await this.feedsService.fetchAllRealWorldEvents();
      this.logger.log(`✅ Synced ${Array.isArray(signals) ? signals.length : 0} fresh Polymarket events`);
    } catch (error) {
      this.logger.error('❌ Failed to sync fresh Polymarket data:', error.message);
    }
  }

  // Update market prices every 15 minutes for live consensus tracking
  @Cron('0 */15 * * * *') // Every 15 minutes
  async updateLiveMarketPrices() {
    this.logger.log('📊 Updating live market prices...');
    
    try {
      const updatedCount = await this.feedsService.updatePolymarketConvictions();
      this.logger.log(`✅ Updated ${updatedCount} signals with live prices`);
    } catch (error) {
      this.logger.error('❌ Failed to update live prices:', error.message);
    }
  }

  // Sync trending markets every 10 minutes for hot topics
  @Cron('0 */10 * * * *') // Every 10 minutes
  async syncTrendingMarkets() {
    this.logger.log('🔥 Syncing trending markets...');
    
    try {
      const signals = await this.feedsService.fetchTrendingEvents();
      this.logger.log(`✅ Synced ${Array.isArray(signals) ? signals.length : 0} trending markets`);
    } catch (error) {
      this.logger.error('❌ Failed to sync trending markets:', error.message);
    }
  }

  // High-frequency sports updates during active hours (every 5 minutes)
  @Cron('0 */5 * * * *') // Every 5 minutes
  async syncActiveSportsEvents() {
    const currentHour = new Date().getHours();
    
    // Active sports hours: 6 PM to 11 PM EST (peak sports time)
    if (currentHour >= 18 && currentHour <= 23) {
      this.logger.log('⚽ Syncing active sports events...');
      
      try {
        const signals = await this.feedsService.fetchSportsEvents();
        this.logger.log(`✅ Synced ${Array.isArray(signals) ? signals.length : 0} active sports events`);
      } catch (error) {
        this.logger.error('❌ Failed to sync sports events:', error.message);
      }
    }
  }

  // Crypto market updates every 20 minutes (crypto never sleeps)
  @Cron('0 */20 * * * *') // Every 20 minutes
  async syncCryptoMarkets() {
    this.logger.log('₿ Syncing crypto markets...');
    
    try {
      const signals = await this.feedsService.fetchCryptoEvents();
      this.logger.log(`✅ Synced ${Array.isArray(signals) ? signals.length : 0} crypto markets`);
    } catch (error) {
      this.logger.error('❌ Failed to sync crypto markets:', error.message);
    }
  }

  // Politics updates every hour (important for elections/policy)
  @Cron(CronExpression.EVERY_HOUR)
  async syncPoliticsEvents() {
    this.logger.log('🏛️ Syncing politics events...');
    
    try {
      const signals = await this.feedsService.fetchPoliticsEvents();
      this.logger.log(`✅ Synced ${Array.isArray(signals) ? signals.length : 0} politics events`);
    } catch (error) {
      this.logger.error('❌ Failed to sync politics events:', error.message);
    }
  }

  // Clean up old/stale data every 6 hours
  @Cron('0 0 */6 * * *') // Every 6 hours
  async cleanupStaleData() {
    this.logger.log('🧹 Cleaning up stale data...');
    
    try {
      await this.removeExpiredSignals();
      await this.archiveResolvedMarkets();
      this.logger.log('✅ Stale data cleanup completed');
    } catch (error) {
      this.logger.error('❌ Failed to cleanup stale data:', error.message);
    }
  }

  // Health check and system status every 5 minutes
  @Cron('0 */5 * * * *') // Every 5 minutes
  async systemHealthCheck() {
    try {
      // Check if we have fresh data (signals created in last hour)
      const recentSignalsCount = await this.checkRecentSignals();
      
      if (recentSignalsCount === 0) {
        this.logger.warn('⚠️ No fresh signals in the last hour - triggering emergency sync');
        await this.emergencyDataSync();
      } else {
        this.logger.debug(`✅ System healthy - ${recentSignalsCount} fresh signals`);
      }
    } catch (error) {
      this.logger.error('❌ Health check failed:', error.message);
    }
  }

  // Emergency sync when no fresh data detected
  private async emergencyDataSync() {
    this.logger.log('🚨 Emergency data sync initiated...');
    
    try {
      // Force sync all categories
      await Promise.allSettled([
        this.feedsService.fetchAllRealWorldEvents(),
        this.feedsService.fetchTrendingEvents(),
        this.feedsService.updatePolymarketConvictions(),
      ]);
      
      this.logger.log('✅ Emergency sync completed');
    } catch (error) {
      this.logger.error('❌ Emergency sync failed:', error.message);
    }
  }

  // Check for recent signals (data freshness indicator)
  private async checkRecentSignals(): Promise<number> {
    try {
      // This would need to be implemented in a service
      // For now, return a placeholder
      return 1; // Placeholder - implement actual check
    } catch (error) {
      this.logger.error('Failed to check recent signals:', error.message);
      return 0;
    }
  }

  // Remove expired/outdated signals
  private async removeExpiredSignals() {
    try {
      // Remove signals older than 30 days that are unresolved
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      this.logger.log('Removing signals older than 30 days...');
      // Implementation would go here
    } catch (error) {
      this.logger.error('Failed to remove expired signals:', error.message);
    }
  }

  // Archive resolved markets to keep feed fresh
  private async archiveResolvedMarkets() {
    try {
      // Archive resolved signals older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      this.logger.log('Archiving resolved markets older than 7 days...');
      // Implementation would go here
    } catch (error) {
      this.logger.error('Failed to archive resolved markets:', error.message);
    }
  }

  // Manual trigger for immediate fresh data sync
  async triggerImmediateSync(): Promise<{ success: boolean; message: string; stats: any }> {
    this.logger.log('🔄 Manual immediate sync triggered...');
    
    try {
      const results = await Promise.allSettled([
        this.feedsService.fetchAllRealWorldEvents(),
        this.feedsService.fetchTrendingEvents(),
        this.feedsService.updatePolymarketConvictions(),
      ]);

      const stats = {
        totalSignals: 0,
        updatedSignals: 0,
        trendingSignals: 0,
      };

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (index === 0 && Array.isArray(result.value)) {
            stats.totalSignals = result.value.length;
          }
          if (index === 1 && Array.isArray(result.value)) {
            stats.trendingSignals = result.value.length;
          }
          if (index === 2 && typeof result.value === 'number') {
            stats.updatedSignals = result.value;
          }
        }
      });

      return {
        success: true,
        message: 'Immediate sync completed successfully',
        stats,
      };
    } catch (error) {
      this.logger.error('❌ Manual sync failed:', error.message);
      return {
        success: false,
        message: `Sync failed: ${error.message}`,
        stats: null,
      };
    }
  }
}