import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PolymarketService } from '../polymarket/polymarket.service';

@Injectable()
export class FeedsService {
  private readonly logger = new Logger(FeedsService.name);

  constructor(
    private prisma: PrismaService,
    private polymarketService: PolymarketService,
  ) {}

  // Fetch all real-world events from Polymarket
  async fetchAllRealWorldEvents() {
    this.logger.log('Fetching real-world events from Polymarket...');

    try {
      // Polymarket contains all the real-world events we need:
      // - Sports (NFL, NBA, Soccer, etc.)
      // - Politics (Elections, Policy outcomes)
      // - Crypto (Price predictions)
      // - Finance (Market predictions)
      // - Current events and news
      const signals = await this.polymarketService.fetchActiveMarkets();
      
      this.logger.log(`✓ Created ${signals.length} signals from Polymarket prediction markets`);
      return signals;
    } catch (error) {
      this.logger.error('Failed to fetch Polymarket events:', error.message);
      return [];
    }
  }

  // Fetch sports events from Polymarket
  async fetchSportsEvents() {
    try {
      this.logger.log('Fetching sports events from Polymarket...');
      const signals = await this.polymarketService.fetchSportsMarkets();
      this.logger.log(`✓ sports events: ${signals.length} signals`);
      return signals;
    } catch (error) {
      this.logger.error('Failed to fetch sports events:', error.message);
      return [];
    }
  }

  // Fetch politics events from Polymarket
  async fetchPoliticsEvents() {
    try {
      this.logger.log('Fetching politics events from Polymarket...');
      const signals = await this.polymarketService.fetchPoliticsMarkets();
      this.logger.log(`✓ politics events: ${signals.length} signals`);
      return signals;
    } catch (error) {
      this.logger.error('Failed to fetch politics events:', error.message);
      return [];
    }
  }

  // Fetch crypto events from Polymarket
  async fetchCryptoEvents() {
    try {
      this.logger.log('Fetching crypto events from Polymarket...');
      const signals = await this.polymarketService.fetchCryptoMarkets();
      this.logger.log(`✓ crypto events: ${signals.length} signals`);
      return signals;
    } catch (error) {
      this.logger.error('Failed to fetch crypto events:', error.message);
      return [];
    }
  }

  // Fetch trending events from Polymarket
  async fetchTrendingEvents() {
    try {
      this.logger.log('Fetching trending events from Polymarket...');
      const markets = await this.polymarketService.getTrendingMarkets();
      
      // Convert trending markets to signals
      const signals = [];
      for (const market of markets) {
        try {
          // Use the same conversion logic as in PolymarketService
          const signal = await this.polymarketService.fetchActiveMarkets();
          if (signal) signals.push(...signal);
        } catch (error) {
          this.logger.warn(`Failed to process trending market:`, error.message);
          continue;
        }
      }
      
      this.logger.log(`✓ trending events: ${signals.length} signals`);
      return signals;
    } catch (error) {
      this.logger.error('Failed to fetch trending events:', error.message);
      return [];
    }
  }

  // Update existing Polymarket signals with latest prices
  async updatePolymarketConvictions() {
    try {
      this.logger.log('Updating Polymarket conviction data...');
      const updatedCount = await this.polymarketService.syncConvictionsFromPolymarket();
      this.logger.log(`✓ Updated ${updatedCount} Polymarket signals with latest prices`);
      return updatedCount;
    } catch (error) {
      this.logger.error('Failed to update Polymarket convictions:', error.message);
      return 0;
    }
  }
}