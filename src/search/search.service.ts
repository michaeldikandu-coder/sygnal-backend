import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchSignals(query: string, filters?: string) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Query must be at least 2 characters long');
    }

    const where: any = {
      OR: [
        { content: { contains: query, mode: 'insensitive' } },
        { topic: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Apply filters if provided
    if (filters) {
      try {
        const filterObj = JSON.parse(filters);
        if (filterObj.category) {
          where.category = filterObj.category;
        }
        if (filterObj.timeframe) {
          where.timeframe = filterObj.timeframe;
        }
      } catch (error) {
        // Ignore invalid filter JSON
      }
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
        { createdAt: 'desc' },
      ],
      take: 50,
    });

    return signals;
  }

  async searchUsers(query: string) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Query must be at least 2 characters long');
    }

    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { handle: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        handle: true,
        avatar: true,
        verified: true,
        credibilityScore: true,
        _count: {
          select: {
            followers: true,
            signals: true,
          },
        },
      },
      orderBy: {
        credibilityScore: 'desc',
      },
      take: 20,
    });

    return users;
  }

  async searchTopics(query: string) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Query must be at least 2 characters long');
    }

    // Search in both topics table and signal topics
    const [topics, signalTopics] = await Promise.all([
      this.prisma.topic.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
        },
        orderBy: {
          momentum: 'desc',
        },
        take: 10,
      }),
      this.prisma.signal.groupBy({
        by: ['topic'],
        where: {
          topic: {
            contains: query,
            mode: 'insensitive',
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    // Combine and format results
    const combinedTopics = [
      ...topics.map(topic => ({
        name: topic.name,
        category: topic.category,
        trending: topic.trending,
        momentum: topic.momentum,
        signalCount: 0, // Would need separate query
      })),
      ...signalTopics.map(topic => ({
        name: topic.topic,
        category: 'Signal Topic',
        trending: false,
        momentum: 0,
        signalCount: topic._count.id,
      })),
    ];

    return combinedTopics;
  }
}