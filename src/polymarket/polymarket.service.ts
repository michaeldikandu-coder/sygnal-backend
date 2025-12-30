import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class PolymarketService {
  private readonly logger = new Logger(PolymarketService.name);
  private readonly baseUrl = 'https://gamma-api.polymarket.com';

  constructor(private prisma: PrismaService) {}

  // Fetch active markets from Polymarket
  async fetchActiveMarkets() {
    try {
      const response = await axios.get(`${this.baseUrl}/markets`, {
        params: {
          active: true,
          closed: false,
          limit: 50,
          offset: 0,
        },
        timeout: 10000,
      });

      const markets = response.data;
      this.logger.log(`Fetched ${markets.length} active markets from Polymarket`);
      
      const signals = [];
      for (const market of markets) {
        try {
          const signal = await this.createSignalFromMarket(market);
          if (signal) signals.push(signal);
        } catch (error) {
          this.logger.warn(`Failed to create signal for market ${market.id}:`, error.message);
          continue;
        }
      }

      this.logger.log(`✓ polymarket events: ${signals.length} signals`);
      return signals;
    } catch (error) {
      this.logger.error('Failed to fetch Polymarket markets:', error.message);
      return [];
    }
  }

  // Fetch markets by category
  async fetchMarketsByCategory(category: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/markets`, {
        params: {
          active: true,
          closed: false,
          tag: category.toLowerCase(),
          limit: 20,
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch ${category} markets:`, error.message);
      return [];
    }
  }

  // Fetch specific market details
  async fetchMarketDetails(marketId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/markets/${marketId}`, {
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch market ${marketId}:`, error.message);
      return null;
    }
  }

  // Fetch market prices/odds
  async fetchMarketPrices(marketId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/prices`, {
        params: {
          market: marketId,
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch prices for market ${marketId}:`, error.message);
      return null;
    }
  }

  // Fetch sports markets
  async fetchSportsMarkets() {
    const sportsCategories = ['sports', 'nfl', 'nba', 'soccer', 'baseball', 'football'];
    const allSportsMarkets = [];

    for (const category of sportsCategories) {
      const markets = await this.fetchMarketsByCategory(category);
      allSportsMarkets.push(...markets);
    }

    return allSportsMarkets;
  }

  // Fetch politics markets
  async fetchPoliticsMarkets() {
    const politicsCategories = ['politics', 'elections', 'biden', 'trump', 'congress'];
    const allPoliticsMarkets = [];

    for (const category of politicsCategories) {
      const markets = await this.fetchMarketsByCategory(category);
      allPoliticsMarkets.push(...markets);
    }

    return allPoliticsMarkets;
  }

  // Fetch crypto markets
  async fetchCryptoMarkets() {
    const cryptoCategories = ['crypto', 'bitcoin', 'ethereum', 'defi'];
    const allCryptoMarkets = [];

    for (const category of cryptoCategories) {
      const markets = await this.fetchMarketsByCategory(category);
      allCryptoMarkets.push(...markets);
    }

    return allCryptoMarkets;
  }

  // Convert Polymarket market to Sygnal signal
  private async createSignalFromMarket(market: any) {
    try {
      const systemUser = await this.getOrCreateSystemUser();

      // Check if signal already exists
      const existingSignal = await this.prisma.signal.findFirst({
        where: {
          topic: `Polymarket: ${market.question}`,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
          },
        },
      });

      if (existingSignal) {
        this.logger.debug(`Signal for market "${market.question}" already exists`);
        return null;
      }

      // Get market prices for consensus calculation
      const prices = await this.fetchMarketPrices(market.id);
      let consensus = 50.0; // Default
      let momentum = 0.0;

      if (prices && prices.length > 0) {
        // Calculate consensus from YES token price (Polymarket uses 0-1 scale)
        const yesPrice = prices.find(p => p.outcome === 'Yes')?.price || 0.5;
        consensus = yesPrice * 100; // Convert to 0-100 scale
        
        // Calculate momentum from recent price changes
        const priceChange = prices.find(p => p.outcome === 'Yes')?.change24h || 0;
        momentum = Math.abs(priceChange) * 100;
      }

      // Determine category based on market tags
      const category = this.categorizeMarket(market);

      // Create content with market details
      const content = this.formatMarketContent(market, consensus);

      const signal = await this.prisma.signal.create({
        data: {
          userId: systemUser.id,
          content,
          topic: `Polymarket: ${market.question}`,
          category,
          timeframe: this.determineTimeframe(market),
          consensus,
          momentum,
          participantCount: parseInt(market.volume) || 0,
        },
      });

      // Create thesis attachment with Polymarket link
      if (market.id) {
        await this.prisma.thesis.create({
          data: {
            signalId: signal.id,
            url: `https://polymarket.com/event/${market.slug || market.id}`,
            title: market.question,
            source: 'Polymarket',
            imageUrl: market.image || null,
          },
        });
      }

      return signal;
    } catch (error) {
      this.logger.error('Failed to create signal from Polymarket market:', error.message);
      return null;
    }
  }

  // Format market content for signal
  private formatMarketContent(market: any, consensus: number): string {
    const endDate = market.endDate ? new Date(market.endDate).toLocaleDateString() : 'TBD';
    const volume = market.volume ? `$${(market.volume / 1000000).toFixed(1)}M` : 'N/A';
    
    return `${market.question}

📊 Current Market Consensus: ${consensus.toFixed(1)}%
💰 Trading Volume: ${volume}
📅 Resolution Date: ${endDate}
🏛️ Source: Polymarket

What do you think will happen?`;
  }

  // Categorize market based on tags and content
  private categorizeMarket(market: any): string {
    const question = market.question.toLowerCase();
    const tags = (market.tags || []).map(tag => tag.toLowerCase());
    const allText = `${question} ${tags.join(' ')}`;

    if (allText.includes('election') || allText.includes('biden') || allText.includes('trump') || 
        allText.includes('congress') || allText.includes('politics') || allText.includes('president')) {
      return 'Politics';
    }
    
    if (allText.includes('nfl') || allText.includes('nba') || allText.includes('soccer') || 
        allText.includes('football') || allText.includes('baseball') || allText.includes('sports')) {
      return 'Sports';
    }
    
    if (allText.includes('bitcoin') || allText.includes('ethereum') || allText.includes('crypto') || 
        allText.includes('defi') || allText.includes('nft')) {
      return 'Finance';
    }
    
    if (allText.includes('ai') || allText.includes('tech') || allText.includes('apple') || 
        allText.includes('google') || allText.includes('tesla')) {
      return 'Technology';
    }
    
    if (allText.includes('climate') || allText.includes('weather') || allText.includes('science')) {
      return 'Science';
    }

    return 'Politics'; // Default for most Polymarket content
  }

  // Determine timeframe based on market end date
  private determineTimeframe(market: any): string {
    if (!market.endDate) return '1y';

    const endDate = new Date(market.endDate);
    const now = new Date();
    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return '1d';
    if (diffDays <= 7) return '7d';
    if (diffDays <= 30) return '1m';
    if (diffDays <= 90) return '3m';
    if (diffDays <= 180) return '6m';
    if (diffDays <= 365) return '1y';
    
    return '2y';
  }

  // Get or create system user for Polymarket signals
  private async getOrCreateSystemUser() {
    try {
      let systemUser = await this.prisma.user.findUnique({
        where: { email: 'polymarket@sygnal.ai' },
      });

      if (!systemUser) {
        systemUser = await this.prisma.user.create({
          data: {
            email: 'polymarket@sygnal.ai',
            name: 'Polymarket Oracle',
            handle: 'polymarket_oracle',
            passwordHash: 'system',
            verified: true,
            credibilityScore: 95.0,
            avatar: 'https://polymarket.com/favicon.ico',
          },
        });
      }

      return systemUser;
    } catch (error) {
      this.logger.error('Failed to get/create Polymarket system user:', error.message);
      throw error;
    }
  }

  // Sync conviction data from Polymarket prices
  async syncConvictionsFromPolymarket() {
    try {
      // Find all Polymarket signals
      const polymarketSignals = await this.prisma.signal.findMany({
        where: {
          topic: {
            startsWith: 'Polymarket:',
          },
        },
        include: {
          thesis: true,
        },
      });

      let updatedCount = 0;

      for (const signal of polymarketSignals) {
        try {
          // Extract market ID from thesis URL
          const thesis = signal.thesis[0];
          if (!thesis || !thesis.url) continue;

          const marketId = this.extractMarketIdFromUrl(thesis.url);
          if (!marketId) continue;

          // Fetch current market prices
          const prices = await this.fetchMarketPrices(marketId);
          if (!prices || prices.length === 0) continue;

          // Update signal consensus based on current market price
          const yesPrice = prices.find(p => p.outcome === 'Yes')?.price || 0.5;
          const newConsensus = yesPrice * 100;

          // Calculate momentum from price change
          const priceChange = prices.find(p => p.outcome === 'Yes')?.change24h || 0;
          const newMomentum = Math.abs(priceChange) * 100;

          // Update signal
          await this.prisma.signal.update({
            where: { id: signal.id },
            data: {
              consensus: newConsensus,
              momentum: newMomentum,
            },
          });

          updatedCount++;
        } catch (error) {
          this.logger.warn(`Failed to update signal ${signal.id}:`, error.message);
          continue;
        }
      }

      this.logger.log(`Updated ${updatedCount} Polymarket signals with latest prices`);
      return updatedCount;
    } catch (error) {
      this.logger.error('Failed to sync convictions from Polymarket:', error.message);
      return 0;
    }
  }

  // Extract market ID from Polymarket URL
  private extractMarketIdFromUrl(url: string): string | null {
    try {
      const match = url.match(/\/event\/([^\/\?]+)/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  // Get trending markets by volume
  async getTrendingMarkets() {
    try {
      const response = await axios.get(`${this.baseUrl}/markets`, {
        params: {
          active: true,
          closed: false,
          limit: 20,
          order: 'volume24hr',
          direction: 'desc',
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch trending markets:', error.message);
      return [];
    }
  }
}