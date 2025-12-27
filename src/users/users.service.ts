import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
        avatar: true,
        verified: true,
        credibilityScore: true,
        accuracy: true,
        accountAge: true,
        dailyPoints: true,
        streak: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: {
            followers: true,
            following: true,
            signals: true,
            convictions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const { name, handle, avatar } = updateProfileDto;

    // Check if handle is already taken by another user
    if (handle) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          handle,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new ConflictException('Handle is already taken');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(handle && { handle }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
        avatar: true,
        verified: true,
        credibilityScore: true,
        accuracy: true,
        accountAge: true,
        dailyPoints: true,
        streak: true,
      },
    });

    return updatedUser;
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        handle: true,
        avatar: true,
        verified: true,
        credibilityScore: true,
        accuracy: true,
        accountAge: true,
        streak: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            signals: true,
            convictions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
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
          },
        },
      },
      take: 20,
      orderBy: {
        credibilityScore: 'desc',
      },
    });

    return users;
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    // Check if target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if already following
    const existingFollow = await this.prisma.follow.findFirst({
      where: {
        followerId,
        followingId,
      },
    });

    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    return { message: 'Successfully followed user' };
  }

  async unfollowUser(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findFirst({
      where: {
        followerId,
        followingId,
      },
    });

    if (!follow) {
      throw new NotFoundException('Not following this user');
    }

    await this.prisma.follow.delete({
      where: {
        id: follow.id,
      },
    });

    return { message: 'Successfully unfollowed user' };
  }

  async getFollowers(userId: string) {
    const followers = await this.prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatar: true,
            verified: true,
            credibilityScore: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return followers.map(follow => follow.follower);
  }

  async getFollowing(userId: string) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatar: true,
            verified: true,
            credibilityScore: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return following.map(follow => follow.following);
  }

  async getUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        credibilityScore: true,
        accuracy: true,
        accountAge: true,
        dailyPoints: true,
        streak: true,
        _count: {
          select: {
            signals: true,
            convictions: true,
            challengesCreated: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate additional stats
    const resolvedSignals = await this.prisma.signal.count({
      where: {
        userId,
        resolvedAt: { not: null },
      },
    });

    const correctPredictions = await this.prisma.signal.count({
      where: {
        userId,
        resolvedAt: { not: null },
        // This would need more complex logic based on how you determine "correct"
      },
    });

    return {
      ...user,
      resolvedSignals,
      correctPredictions,
    };
  }

  async getCredibilityHistory(userId: string) {
    const history = await this.prisma.credibilityHistory.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 100,
    });

    return history;
  }

  async getUserPredictions(userId: string) {
    const predictions = await this.prisma.signal.findMany({
      where: { userId },
      include: {
        convictions: {
          select: {
            value: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            convictions: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return predictions;
  }

  async getUserChallenges(userId: string) {
    const challenges = await this.prisma.challenge.findMany({
      where: {
        OR: [
          { challengerId: userId },
          { targetId: userId },
        ],
      },
      include: {
        signal: {
          select: {
            id: true,
            content: true,
            consensus: true,
          },
        },
        challenger: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatar: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return challenges;
  }
}