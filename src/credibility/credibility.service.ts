import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CredibilityService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard() {
    const topUsers = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        handle: true,
        avatar: true,
        verified: true,
        credibilityScore: true,
        accuracy: true,
        _count: {
          select: {
            signals: true,
            convictions: true,
            followers: true,
          },
        },
      },
      orderBy: {
        credibilityScore: 'desc',
      },
      take: 100,
    });

    return topUsers.map((user, index) => ({
      rank: index + 1,
      ...user,
    }));
  }

  async getUserScore(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        handle: true,
        credibilityScore: true,
        accuracy: true,
        streak: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user's rank
    const higherScoreCount = await this.prisma.user.count({
      where: {
        credibilityScore: {
          gt: user.credibilityScore,
        },
      },
    });

    const rank = higherScoreCount + 1;

    return {
      ...user,
      rank,
    };
  }

  async stakeCredibility(userId: string, amount: number) {
    // This would implement credibility staking logic
    // For now, just return a placeholder
    return {
      message: 'Credibility staking not yet implemented',
      userId,
      amount,
    };
  }

  async getTransactions(userId: string) {
    const history = await this.prisma.credibilityHistory.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 50,
    });

    return history;
  }
}