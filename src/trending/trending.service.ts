import { Injectable } from '@nestjs/common';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrendingService {
  constructor(
    private prisma: PrismaService,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getTrendingSignals() {
    // const cacheKey = 'trending:signals';
    
    // Try to get from cache first (disabled for now)
    // let trendingSignals = await this.cacheManager.get(cacheKey);
    
    // if (!trendingSignals) {
      // Calculate trending signals based on momentum and recent activity
      const trendingSignals = await this.prisma.signal.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              handle: true,
              avatar: true,
              verified: true,
              credibilityScore: true,
            },
          },
          _count: {
            select: {
              convictions: true,
              comments: true,
              remixes: true,
              shares: true,
            },
          },
        },
        orderBy: [
          { momentum: 'desc' },
          { participantCount: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 20,
      });

      // Cache for 5 minutes (disabled for now)
      // await this.cacheManager.set(cacheKey, trendingSignals, 300);
    // }

    return trendingSignals;
  }

  async getTrendingNarratives() {
    // const cacheKey = 'trending:narratives';
    
    // let trendingNarratives = await this.cacheManager.get(cacheKey);
    
    // if (!trendingNarratives) {
      // Group signals by category and sum their momentum
      const narratives = await this.prisma.signal.groupBy({
        by: ['category'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        _sum: {
          momentum: true,
        },
        _count: {
          id: true,
        },
        _avg: {
          consensus: true,
        },
        orderBy: {
          _sum: {
            momentum: 'desc',
          },
        },
        take: 10,
      });

      // Format the results
      const trendingNarratives = narratives.map(narrative => ({
        category: narrative.category,
        totalMomentum: narrative._sum.momentum || 0,
        signalCount: narrative._count.id,
        averageConsensus: narrative._avg.consensus || 50,
      }));

      // Cache for 5 minutes (disabled for now)
      // await this.cacheManager.set(cacheKey, trendingNarratives, 300);
    // }

    return trendingNarratives;
  }

  async getTrendingUsers() {
    // const cacheKey = 'trending:users';
    
    // let trendingUsers = await this.cacheManager.get(cacheKey);
    
    // if (!trendingUsers) {
      // Get users with highest credibility and recent activity
      const trendingUsers = await this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          handle: true,
          avatar: true,
          verified: true,
          credibilityScore: true,
          accuracy: true,
          streak: true,
          _count: {
            select: {
              signals: true,
              convictions: true,
              followers: true,
            },
          },
        },
        orderBy: [
          { credibilityScore: 'desc' },
          { accuracy: 'desc' },
        ],
        take: 20,
      });

      // Cache for 5 minutes (disabled for now)
      // await this.cacheManager.set(cacheKey, trendingUsers, 300);
    // }

    return trendingUsers;
  }

  async getDiscoverSignals(category?: string, timeframe?: string) {
    // const cacheKey = `discover:signals:${category || 'all'}:${timeframe || 'all'}`;
    
    // let signals = await this.cacheManager.get(cacheKey);
    
    // if (!signals) {
      const where: any = {};
      
      if (category) {
        where.category = category;
      }
      
      if (timeframe) {
        const timeframes = {
          '1h': 1,
          '24h': 24,
          '7d': 24 * 7,
          '30d': 24 * 30,
        };
        
        const hours = timeframes[timeframe] || 24;
        where.createdAt = {
          gte: new Date(Date.now() - hours * 60 * 60 * 1000),
        };
      }

      const signals = await this.prisma.signal.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              handle: true,
              avatar: true,
              verified: true,
              credibilityScore: true,
            },
          },
          _count: {
            select: {
              convictions: true,
              comments: true,
              remixes: true,
            },
          },
        },
        orderBy: [
          { momentum: 'desc' },
          { consensus: 'desc' },
        ],
        take: 50,
      });

      // Cache for 2 minutes for discover queries (disabled for now)
      // await this.cacheManager.set(cacheKey, signals, 120);
    // }

    return signals;
  }
}