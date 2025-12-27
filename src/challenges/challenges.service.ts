import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { ResolveChallengeDto } from './dto/resolve-challenge.dto';

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaService) {}

  async createChallenge(
    challengerId: string,
    signalId: string,
    createChallengeDto: CreateChallengeDto,
  ) {
    const { targetId, stakeAmount } = createChallengeDto;

    // Get challenger and signal
    const [challenger, signal] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: challengerId },
        select: { dailyPoints: true, credibilityScore: true },
      }),
      this.prisma.signal.findUnique({
        where: { id: signalId },
      }),
    ]);

    if (!challenger) {
      throw new NotFoundException('Challenger not found');
    }

    if (!signal) {
      throw new NotFoundException('Signal not found');
    }

    // Check if signal is resolved
    if (signal.resolvedAt) {
      throw new BadRequestException('Cannot challenge resolved signal');
    }

    // Check if challenger has enough points
    if (stakeAmount > challenger.dailyPoints) {
      throw new HttpException(
        `Insufficient points. Available: ${challenger.dailyPoints}, Required: ${stakeAmount}`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    // Validate target user if specified
    if (targetId) {
      if (targetId === challengerId) {
        throw new BadRequestException('Cannot challenge yourself');
      }

      const target = await this.prisma.user.findUnique({
        where: { id: targetId },
      });

      if (!target) {
        throw new NotFoundException('Target user not found');
      }
    }

    // Create challenge and deduct stake in transaction
    const challenge = await this.prisma.$transaction(async (tx) => {
      // Deduct stake from challenger immediately
      await tx.user.update({
        where: { id: challengerId },
        data: {
          dailyPoints: {
            decrement: stakeAmount,
          },
        },
      });

      // Create challenge
      const newChallenge = await tx.challenge.create({
        data: {
          signalId,
          challengerId,
          targetId,
          stakeAmount,
          status: 'PENDING',
        },
        include: {
          signal: {
            select: {
              id: true,
              content: true,
              consensus: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  handle: true,
                },
              },
            },
          },
          challenger: {
            select: {
              id: true,
              name: true,
              handle: true,
              avatar: true,
              credibilityScore: true,
            },
          },
          target: {
            select: {
              id: true,
              name: true,
              handle: true,
              avatar: true,
              credibilityScore: true,
            },
          },
        },
      });

      return newChallenge;
    });

    return challenge;
  }

  async getChallengeById(challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        signal: {
          select: {
            id: true,
            content: true,
            consensus: true,
            momentum: true,
            user: {
              select: {
                id: true,
                name: true,
                handle: true,
              },
            },
          },
        },
        challenger: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatar: true,
            credibilityScore: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatar: true,
            credibilityScore: true,
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    return challenge;
  }

  async acceptChallenge(userId: string, challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        signal: true,
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.status !== 'PENDING') {
      throw new BadRequestException('Challenge is not pending');
    }

    // Check if user is the target (if specified) or can accept open challenge
    if (challenge.targetId && challenge.targetId !== userId) {
      throw new ForbiddenException('You are not the target of this challenge');
    }

    if (challenge.challengerId === userId) {
      throw new BadRequestException('Cannot accept your own challenge');
    }

    // Get user to check points
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { dailyPoints: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has enough points to match the stake
    if (challenge.stakeAmount > user.dailyPoints) {
      throw new HttpException(
        `Insufficient points. Available: ${user.dailyPoints}, Required: ${challenge.stakeAmount}`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    // Accept challenge and deduct stake in transaction
    const updatedChallenge = await this.prisma.$transaction(async (tx) => {
      // Deduct stake from target
      await tx.user.update({
        where: { id: userId },
        data: {
          dailyPoints: {
            decrement: challenge.stakeAmount,
          },
        },
      });

      // Update challenge status and set target if it was open
      const updated = await tx.challenge.update({
        where: { id: challengeId },
        data: {
          status: 'ACCEPTED',
          targetId: userId,
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
      });

      return updated;
    });

    return updatedChallenge;
  }

  async resolveChallenge(
    userId: string,
    challengeId: string,
    resolveChallengeDto: ResolveChallengeDto,
  ) {
    const { winnerId } = resolveChallengeDto;

    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        signal: true,
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.status !== 'ACCEPTED') {
      throw new BadRequestException('Challenge is not accepted');
    }

    // For now, only allow admin resolution (in production, you'd have oracle logic)
    // You could check for admin role here
    
    // Validate winner is one of the participants
    if (winnerId !== challenge.challengerId && winnerId !== challenge.targetId) {
      throw new BadRequestException('Winner must be one of the challenge participants');
    }

    // Resolve challenge and transfer stakes in transaction
    const resolvedChallenge = await this.prisma.$transaction(async (tx) => {
      // Calculate total prize (2x stake amount)
      const totalPrize = challenge.stakeAmount * 2;

      // Award prize to winner
      await tx.user.update({
        where: { id: winnerId },
        data: {
          dailyPoints: {
            increment: totalPrize,
          },
        },
      });

      // Update credibility scores
      const credibilityChange = 5; // Base credibility change

      // Winner gains credibility
      await tx.user.update({
        where: { id: winnerId },
        data: {
          credibilityScore: {
            increment: credibilityChange,
          },
        },
      });

      // Loser loses credibility
      const loserId = winnerId === challenge.challengerId ? challenge.targetId : challenge.challengerId;
      await tx.user.update({
        where: { id: loserId },
        data: {
          credibilityScore: {
            decrement: credibilityChange,
          },
        },
      });

      // Create credibility history entries
      await tx.credibilityHistory.createMany({
        data: [
          {
            userId: winnerId,
            score: 0, // Will be updated with actual score
            change: credibilityChange,
            reason: `Won challenge #${challengeId}`,
          },
          {
            userId: loserId,
            score: 0, // Will be updated with actual score
            change: -credibilityChange,
            reason: `Lost challenge #${challengeId}`,
          },
        ],
      });

      // Update challenge
      const updated = await tx.challenge.update({
        where: { id: challengeId },
        data: {
          status: 'RESOLVED',
          winnerId,
          resolvedAt: new Date(),
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
      });

      return updated;
    });

    return resolvedChallenge;
  }
}