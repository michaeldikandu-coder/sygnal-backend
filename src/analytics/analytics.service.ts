import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSignalPerformance(signalId: string) {
    const signal = await this.prisma.signal.findUnique({
      where: { id: signalId },
      include: {
        convictions: {
          include: {
            user: {
              select: {
                credibilityScore: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
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
    });

    if (!signal) {
      throw new NotFoundException('Signal not found');
    }

    // Calculate performance metrics
    const convictionHistory = signal.convictions.map(conviction => ({
      timestamp: conviction.createdAt,
      value: conviction.value,
      weight: conviction.weight,
      userCredibility: conviction.user.credibilityScore,
    }));

    // Calculate consensus over time
    const consensusHistory = [];
    let runningTotal = 0;
    let runningWeight = 0;

    for (const conviction of signal.convictions) {
      runningTotal += conviction.value * conviction.weight;
      runningWeight += conviction.weight;
      
      const consensus = runningWeight > 0 ? (runningTotal / runningWeight + 100) / 2 : 50;
      
      consensusHistory.push({
        timestamp: conviction.createdAt,
        consensus,
        participantCount: consensusHistory.length + 1,
      });
    }

    return {
      signal: {
        id: signal.id,
        content: signal.content,
        category: signal.category,
        currentConsensus: signal.consensus,
        momentum: signal.momentum,
        participantCount: signal.participantCount,
        createdAt: signal.createdAt,
        resolvedAt: signal.resolvedAt,
      },
      performance: {
        convictionHistory,
        consensusHistory,
        totalEngagement: signal._count.convictions + signal._count.comments + signal._count.remixes,
        shareCount: signal._count.shares,
      },
    };
  }

  async getUserAccuracy(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        handle: true,
        credibilityScore: true,
        accuracy: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user's resolved predictions
    const resolvedSignals = await this.prisma.signal.findMany({
      where: {
        userId,
        resolvedAt: { not: null },
        resolvedValue: { not: null },
      },
      include: {
        convictions: {
          where: { userId },
          select: {
            value: true,
            createdAt: true,
          },
        },
      },
      orderBy: { resolvedAt: 'desc' },
    });

    // Calculate accuracy metrics
    let correctPredictions = 0;
    const predictionHistory = [];

    for (const signal of resolvedSignals) {
      if (signal.convictions.length > 0) {
        const userConviction = signal.convictions[0];
        
        // Determine if prediction was correct
        // This is simplified - you'd need more complex logic based on your resolution criteria
        const predictedDirection = userConviction.value > 0 ? 'positive' : 'negative';
        const actualDirection = signal.resolvedValue > 50 ? 'positive' : 'negative';
        const isCorrect = predictedDirection === actualDirection;
        
        if (isCorrect) {
          correctPredictions++;
        }

        predictionHistory.push({
          signalId: signal.id,
          content: signal.content,
          userConviction: userConviction.value,
          resolvedValue: signal.resolvedValue,
          isCorrect,
          resolvedAt: signal.resolvedAt,
          convictionDate: userConviction.createdAt,
        });
      }
    }

    const totalPredictions = resolvedSignals.length;
    const accuracyPercentage = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;

    // Generate heatmap data (last 365 days)
    const heatmapData = await this.generateAccuracyHeatmap(userId);

    return {
      user,
      accuracy: {
        percentage: accuracyPercentage,
        correctPredictions,
        totalPredictions,
      },
      predictionHistory,
      heatmapData,
    };
  }

  async getMarketSentiment() {
    // Get overall market sentiment from recent signals
    const recentSignals = await this.prisma.signal.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      select: {
        consensus: true,
        momentum: true,
        category: true,
        participantCount: true,
      },
    });

    // Calculate overall sentiment
    const totalSignals = recentSignals.length;
    const averageConsensus = totalSignals > 0 
      ? recentSignals.reduce((sum, signal) => sum + signal.consensus, 0) / totalSignals 
      : 50;

    const averageMomentum = totalSignals > 0
      ? recentSignals.reduce((sum, signal) => sum + signal.momentum, 0) / totalSignals
      : 0;

    // Group by category
    const categoryBreakdown = recentSignals.reduce((acc, signal) => {
      if (!acc[signal.category]) {
        acc[signal.category] = {
          count: 0,
          totalConsensus: 0,
          totalMomentum: 0,
          totalParticipants: 0,
        };
      }
      
      acc[signal.category].count++;
      acc[signal.category].totalConsensus += signal.consensus;
      acc[signal.category].totalMomentum += signal.momentum;
      acc[signal.category].totalParticipants += signal.participantCount;
      
      return acc;
    }, {});

    // Format category data
    const categories = Object.entries(categoryBreakdown).map(([category, data]: [string, any]) => ({
      category,
      signalCount: data.count,
      averageConsensus: data.totalConsensus / data.count,
      averageMomentum: data.totalMomentum / data.count,
      totalParticipants: data.totalParticipants,
    }));

    return {
      overall: {
        totalSignals,
        averageConsensus,
        averageMomentum,
        sentiment: averageConsensus > 60 ? 'bullish' : averageConsensus < 40 ? 'bearish' : 'neutral',
      },
      categories: categories.sort((a, b) => b.averageMomentum - a.averageMomentum),
    };
  }

  private async generateAccuracyHeatmap(userId: string) {
    // Generate heatmap data for the last 365 days
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);

    const resolvedSignals = await this.prisma.signal.findMany({
      where: {
        userId,
        resolvedAt: {
          gte: startDate,
          lte: endDate,
        },
        resolvedValue: { not: null },
      },
      include: {
        convictions: {
          where: { userId },
          select: {
            value: true,
          },
        },
      },
    });

    // Group by date and calculate daily accuracy
    const dailyData = {};
    
    for (const signal of resolvedSignals) {
      if (signal.convictions.length > 0) {
        const date = signal.resolvedAt.toISOString().split('T')[0];
        
        if (!dailyData[date]) {
          dailyData[date] = { correct: 0, total: 0 };
        }
        
        const userConviction = signal.convictions[0];
        const predictedDirection = userConviction.value > 0 ? 'positive' : 'negative';
        const actualDirection = signal.resolvedValue > 50 ? 'positive' : 'negative';
        const isCorrect = predictedDirection === actualDirection;
        
        dailyData[date].total++;
        if (isCorrect) {
          dailyData[date].correct++;
        }
      }
    }

    // Convert to heatmap format
    const heatmapData = Object.entries(dailyData).map(([date, data]: [string, any]) => ({
      date,
      intensity: data.total > 0 ? data.correct / data.total : 0,
      count: data.total,
    }));

    return heatmapData;
  }
}