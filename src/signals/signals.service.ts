import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
// import { InjectQueue } from '@nestjs/bull';
// import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSignalDto } from './dto/create-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';
import { RemixSignalDto } from './dto/remix-signal.dto';
import { FeedQueryDto } from './dto/feed-query.dto';

@Injectable()
export class SignalsService {
  constructor(
    private prisma: PrismaService,
    // @InjectQueue('momentum') private momentumQueue: Queue,
  ) {}

  async getFeed(feedQuery: FeedQueryDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'newest',
      category,
      timeframe,
      userId,
    } = feedQuery;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 50); // Max 50 per page

    let orderBy: any = { createdAt: 'desc' }; // Default: newest

    switch (sortBy) {
      case 'momentum':
        orderBy = { momentum: 'desc' };
        break;
      case 'consensus':
        orderBy = { consensus: 'desc' };
        break;
      case 'participants':
        orderBy = { participantCount: 'desc' };
        break;
    }

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (timeframe) {
      where.timeframe = timeframe;
    }

    if (userId) {
      // Get signals from users that this user follows
      const following = await this.prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });

      const followingIds = following.map(f => f.followingId);
      followingIds.push(userId); // Include own signals

      where.userId = { in: followingIds };
    }

    const [signals, total] = await Promise.all([
      this.prisma.signal.findMany({
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
          parent: {
            select: {
              id: true,
              content: true,
              user: {
                select: {
                  name: true,
                  handle: true,
                },
              },
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
        orderBy,
        skip,
        take,
      }),
      this.prisma.signal.count({ where }),
    ]);

    return {
      signals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async createSignal(userId: string, createSignalDto: CreateSignalDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credibilityScore: true },
    });

    // Check if user has enough credibility to create signals
    const minCredibilityRequired = 25; // Configurable threshold
    if (user.credibilityScore < minCredibilityRequired) {
      throw new ForbiddenException(
        `Minimum credibility score of ${minCredibilityRequired} required to create signals`,
      );
    }

    const signal = await this.prisma.signal.create({
      data: {
        userId,
        content: createSignalDto.content,
        topic: createSignalDto.topic,
        category: createSignalDto.category,
        timeframe: createSignalDto.timeframe,
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
          },
        },
      },
    });

    // Queue momentum calculation job (disabled for now)
    // await this.momentumQueue.add('calculateMomentum', {
    //   signalId: signal.id,
    // });

    return signal;
  }

  async getSignalById(signalId: string) {
    const signal = await this.prisma.signal.findUnique({
      where: { id: signalId },
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
        parent: {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                name: true,
                handle: true,
              },
            },
          },
        },
        convictions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                handle: true,
                avatar: true,
                credibilityScore: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        thesis: true,
        _count: {
          select: {
            convictions: true,
            comments: true,
            remixes: true,
            shares: true,
          },
        },
      },
    });

    if (!signal) {
      throw new NotFoundException('Signal not found');
    }

    return signal;
  }

  async updateSignal(
    userId: string,
    signalId: string,
    updateSignalDto: UpdateSignalDto,
  ) {
    const signal = await this.prisma.signal.findUnique({
      where: { id: signalId },
    });

    if (!signal) {
      throw new NotFoundException('Signal not found');
    }

    if (signal.userId !== userId) {
      throw new ForbiddenException('You can only update your own signals');
    }

    // Don't allow updates if signal has been resolved
    if (signal.resolvedAt) {
      throw new BadRequestException('Cannot update resolved signals');
    }

    const updatedSignal = await this.prisma.signal.update({
      where: { id: signalId },
      data: {
        content: updateSignalDto.content,
        topic: updateSignalDto.topic,
        category: updateSignalDto.category,
        timeframe: updateSignalDto.timeframe,
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
          },
        },
      },
    });

    return updatedSignal;
  }

  async deleteSignal(userId: string, signalId: string) {
    const signal = await this.prisma.signal.findUnique({
      where: { id: signalId },
    });

    if (!signal) {
      throw new NotFoundException('Signal not found');
    }

    if (signal.userId !== userId) {
      throw new ForbiddenException('You can only delete your own signals');
    }

    await this.prisma.signal.delete({
      where: { id: signalId },
    });

    return { message: 'Signal deleted successfully' };
  }

  async remixSignal(
    userId: string,
    originalSignalId: string,
    remixSignalDto: RemixSignalDto,
  ) {
    const originalSignal = await this.prisma.signal.findUnique({
      where: { id: originalSignalId },
    });

    if (!originalSignal) {
      throw new NotFoundException('Original signal not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credibilityScore: true },
    });

    // Check credibility requirement for remixing
    const minCredibilityRequired = 25;
    if (user.credibilityScore < minCredibilityRequired) {
      throw new ForbiddenException(
        `Minimum credibility score of ${minCredibilityRequired} required to remix signals`,
      );
    }

    const remix = await this.prisma.signal.create({
      data: {
        userId,
        content: remixSignalDto.content,
        topic: originalSignal.topic,
        category: originalSignal.category,
        timeframe: originalSignal.timeframe,
        parentId: originalSignalId,
        isRemix: true,
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
        parent: {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                name: true,
                handle: true,
              },
            },
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
    });

    // Queue momentum calculation (disabled for now)
    // await this.momentumQueue.add('calculateMomentum', {
    //   signalId: remix.id,
    // });

    return remix;
  }

  async getSignalRemixes(signalId: string) {
    const remixes = await this.prisma.signal.findMany({
      where: { parentId: signalId },
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
      orderBy: { createdAt: 'desc' },
    });

    return remixes;
  }

  async shareSignal(userId: string, signalId: string, platform?: string) {
    const signal = await this.prisma.signal.findUnique({
      where: { id: signalId },
    });

    if (!signal) {
      throw new NotFoundException('Signal not found');
    }

    await this.prisma.share.create({
      data: {
        signalId,
        userId,
        platform,
      },
    });

    return { message: 'Signal shared successfully' };
  }
}