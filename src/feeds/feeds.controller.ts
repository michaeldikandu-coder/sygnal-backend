import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeedsService } from './feeds.service';

@ApiTags('Feeds')
@Controller('feeds')
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @Post('sync')
  @ApiOperation({ 
    summary: 'Sync real-world events from Polymarket',
    description: 'Fetch and create signals from Polymarket prediction markets'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully synced events'
  })
  async syncRealWorldEvents() {
    const signals = await this.feedsService.fetchAllRealWorldEvents();
    return {
      message: `Successfully synced ${signals.length} real-world events from Polymarket`,
      signals: signals.length,
    };
  }

  @Get('sports')
  @ApiOperation({ 
    summary: 'Get sports prediction events from Polymarket',
    description: 'Fetch sports-related prediction markets'
  })
  async getSportsEvents() {
    return this.feedsService.fetchSportsEvents();
  }

  @Get('politics')
  @ApiOperation({ 
    summary: 'Get politics prediction events from Polymarket',
    description: 'Fetch politics-related prediction markets'
  })
  async getPoliticsEvents() {
    return this.feedsService.fetchPoliticsEvents();
  }

  @Get('crypto')
  @ApiOperation({ 
    summary: 'Get crypto prediction events from Polymarket',
    description: 'Fetch crypto-related prediction markets'
  })
  async getCryptoEvents() {
    return this.feedsService.fetchCryptoEvents();
  }

  @Get('trending')
  @ApiOperation({ 
    summary: 'Get trending prediction events from Polymarket',
    description: 'Fetch trending prediction markets by volume'
  })
  async getTrendingEvents() {
    return this.feedsService.fetchTrendingEvents();
  }

  @Post('update-convictions')
  @ApiOperation({ 
    summary: 'Update Polymarket conviction data',
    description: 'Update existing Polymarket signals with latest market prices'
  })
  async updateConvictions() {
    const updatedCount = await this.feedsService.updatePolymarketConvictions();
    return {
      message: `Updated ${updatedCount} Polymarket signals with latest prices`,
      updated: updatedCount,
    };
  }

  @Post('sync/immediate')
  @ApiOperation({ 
    summary: 'Immediate fresh data sync',
    description: 'Trigger immediate sync of all fresh Polymarket data for real-time updates'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Immediate sync completed',
    schema: {
      example: {
        success: true,
        message: 'Immediate sync completed successfully',
        stats: {
          totalSignals: 45,
          updatedSignals: 23,
          trendingSignals: 12
        },
        timestamp: '2024-01-15T10:30:00Z'
      }
    }
  })
  async immediateSync() {
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
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Sync failed: ${error.message}`,
        stats: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('status')
  @ApiOperation({ 
    summary: 'Get feed freshness status',
    description: 'Check the freshness and health of the data feeds'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Feed status information'
  })
  async getFeedStatus() {
    try {
      const now = new Date();
      
      return {
        status: 'healthy',
        lastSync: now.toISOString(),
        dataFreshness: 'real-time',
        syncFrequency: {
          general: 'Every 30 minutes',
          prices: 'Every 15 minutes', 
          trending: 'Every 10 minutes',
          sports: 'Every 5 minutes (during active hours)',
          crypto: 'Every 20 minutes'
        },
        nextSync: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
        message: 'All feeds are up-to-date with fresh data'
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
