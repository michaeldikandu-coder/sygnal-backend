import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PolymarketService } from './polymarket.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Polymarket')
@Controller('polymarket')
export class PolymarketController {
  constructor(private readonly polymarketService: PolymarketService) {}

  @Get('markets')
  @ApiOperation({ 
    summary: 'Get active Polymarket markets',
    description: 'Fetch active prediction markets from Polymarket API'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of markets to fetch (default: 20)' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of active markets',
    schema: {
      example: {
        success: true,
        count: 15,
        markets: [
          {
            id: 'market-123',
            question: 'Will Bitcoin reach $100k by end of 2024?',
            category: 'crypto',
            endDate: '2024-12-31T23:59:59Z',
            volume: 1500000,
            yesPrice: 0.65
          }
        ]
      }
    }
  })
  async getActiveMarkets(@Query('limit') limit?: string) {
    try {
      const markets = await this.polymarketService.fetchActiveMarkets();
      return {
        success: true,
        count: markets.length,
        markets: markets.slice(0, parseInt(limit) || 20),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('markets/trending')
  @ApiOperation({ 
    summary: 'Get trending Polymarket markets',
    description: 'Fetch trending prediction markets by volume'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of trending markets'
  })
  async getTrendingMarkets() {
    try {
      const markets = await this.polymarketService.getTrendingMarkets();
      return {
        success: true,
        count: markets.length,
        markets,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('markets/sports')
  @ApiOperation({ 
    summary: 'Get sports prediction markets',
    description: 'Fetch sports-related prediction markets from Polymarket'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of sports markets'
  })
  async getSportsMarkets() {
    try {
      const markets = await this.polymarketService.fetchSportsMarkets();
      return {
        success: true,
        count: markets.length,
        markets,
        category: 'sports',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('markets/politics')
  @ApiOperation({ 
    summary: 'Get politics prediction markets',
    description: 'Fetch politics-related prediction markets from Polymarket'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of politics markets'
  })
  async getPoliticsMarkets() {
    try {
      const markets = await this.polymarketService.fetchPoliticsMarkets();
      return {
        success: true,
        count: markets.length,
        markets,
        category: 'politics',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('markets/crypto')
  @ApiOperation({ 
    summary: 'Get crypto prediction markets',
    description: 'Fetch crypto-related prediction markets from Polymarket'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of crypto markets'
  })
  async getCryptoMarkets() {
    try {
      const markets = await this.polymarketService.fetchCryptoMarkets();
      return {
        success: true,
        count: markets.length,
        markets,
        category: 'crypto',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('markets/:marketId')
  @ApiOperation({ 
    summary: 'Get market details',
    description: 'Fetch detailed information about a specific Polymarket market'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Market details'
  })
  async getMarketDetails(@Param('marketId') marketId: string) {
    try {
      const market = await this.polymarketService.fetchMarketDetails(marketId);
      if (!market) {
        return {
          success: false,
          error: 'Market not found',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        market,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('markets/:marketId/prices')
  @ApiOperation({ 
    summary: 'Get market prices',
    description: 'Fetch current prices/odds for a specific Polymarket market'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Market prices and odds'
  })
  async getMarketPrices(@Param('marketId') marketId: string) {
    try {
      const prices = await this.polymarketService.fetchMarketPrices(marketId);
      if (!prices) {
        return {
          success: false,
          error: 'Prices not found',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        prices,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Sync Polymarket data',
    description: 'Manually trigger sync of Polymarket markets to create new signals (Admin only)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sync completed'
  })
  async syncPolymarketData() {
    try {
      const signals = await this.polymarketService.fetchActiveMarkets();
      return {
        success: true,
        message: 'Polymarket data synced successfully',
        signalsCreated: signals.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Post('sync/convictions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Sync conviction data',
    description: 'Update existing Polymarket signals with latest market prices (Admin only)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Convictions synced'
  })
  async syncConvictions() {
    try {
      const updatedCount = await this.polymarketService.syncConvictionsFromPolymarket();
      return {
        success: true,
        message: 'Conviction data synced successfully',
        signalsUpdated: updatedCount,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}