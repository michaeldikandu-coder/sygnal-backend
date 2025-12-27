import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  async getUserAchievements(userId: string) {
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: {
        unlockedAt: 'desc',
      },
    });

    return userAchievements;
  }

  async checkAndUnlockAchievements(userId: string) {
    // Get user stats
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            signals: true,
            convictions: true,
            followers: true,
          },
        },
      },
    });

    if (!user) return [];

    const newAchievements = [];

    // Define achievement criteria
    const achievementCriteria = [
      {
        name: 'First Signal',
        condition: user._count.signals >= 1,
        category: 'signals',
      },
      {
        name: 'Signal Master',
        condition: user._count.signals >= 100,
        category: 'signals',
      },
      {
        name: 'First Conviction',
        condition: user._count.convictions >= 1,
        category: 'convictions',
      },
      {
        name: 'Conviction Champion',
        condition: user._count.convictions >= 500,
        category: 'convictions',
      },
      {
        name: 'Rising Star',
        condition: user._count.followers >= 10,
        category: 'social',
      },
      {
        name: 'Influencer',
        condition: user._count.followers >= 100,
        category: 'social',
      },
      {
        name: 'High Credibility',
        condition: user.credibilityScore >= 80,
        category: 'reputation',
      },
      {
        name: 'Streak Master',
        condition: user.streak >= 7,
        category: 'engagement',
      },
    ];

    // Check each achievement
    for (const criteria of achievementCriteria) {
      if (criteria.condition) {
        const achievement = await this.prisma.achievement.findUnique({
          where: { name: criteria.name },
        });

        if (achievement) {
          // Check if user already has this achievement
          const existing = await this.prisma.userAchievement.findFirst({
            where: {
              userId,
              achievementId: achievement.id,
            },
          });

          if (!existing) {
            // Unlock achievement
            const userAchievement = await this.prisma.userAchievement.create({
              data: {
                userId,
                achievementId: achievement.id,
              },
              include: {
                achievement: true,
              },
            });

            newAchievements.push(userAchievement);
          }
        }
      }
    }

    return newAchievements;
  }
}