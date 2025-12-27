import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
// import { InjectQueue } from '@nestjs/bull';
// import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConvictionDto } from './dto/create-conviction.dto';

@Injectable()
export class ConvictionService {
  constructor(
    private prisma: PrismaService,
    // @InjectQueue('momentum') private momentumQueue: Queue,
  ) {}

  async createConviction(
    userId: string,
    signalId: string,
    createConvictionDto: CreateConvictionDto,
  ) {
    const { value } = createConvictionDto;

    // Validate conviction value range
    if (value < -100 || value > 100) {
      throw new BadRequestException('Conviction value must be between -100 and 100');
    }

    // Get user and signal
    const [user, signal] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          credibilityScore: true,
        },
      }),
      this.prisma.signal.findUnique({
        where: { id: signalId },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!signal) {
      throw new NotFoundException('Signal not found');
    }

    // Check if signal is resolved
    if (signal.resolvedAt) {
      throw new BadRequestException('Cannot add conviction to resolved signal');
    }

    // Calculate weight based on user credibility
    const weight = Math.max(0.1, user.credibilityScore / 100);

    // Use transaction to ensure consistency
    const result = await this.prisma.$transaction(async (tx) => {
      // Check for existing conviction (MongoDB doesn't support unique constraints on multiple fields)
      const existingConviction = await tx.conviction.findFirst({
        where: {
          signalId,
          userId,
        },
      });

      let conviction;

      if (existingConviction) {
        // Update existing conviction
        conviction = await tx.conviction.update({
          where: { id: existingConviction.id },
          data: {
            value,
            weight,
            points: 0, // No points needed anymore
          },
        });
      } else {
        // Create new conviction
        conviction = await tx.conviction.create({
          data: {
            signalId,
            userId,
            value,
            weight,
            points: 0, // No points needed anymore
          },
        });

        // Increment participant count for new conviction
        await tx.signal.update({
          where: { id: signalId },
          data: {
            participantCount: {
              increment: 1,
            },
          },
        });
      }

      // Recalculate consensus immediately
      await this.recalculateConsensus(tx, signalId);

      return conviction;
    });

    // Queue momentum calculation job (disabled for now)
    // await this.momentumQueue.add('calculateMomentum', {
    //   signalId,
    // });

    return result;
  }

  async getUserConviction(userId: string, signalId: string) {
    const conviction = await this.prisma.conviction.findFirst({
      where: {
        signalId,
        userId,
      },
    });

    return conviction;
  }

  async recalculateConsensus(tx: any, signalId: string) {
    // Get all convictions for this signal
    const convictions = await tx.conviction.findMany({
      where: { signalId },
    });

    if (convictions.length === 0) {
      return;
    }

    // Calculate weighted average consensus
    let totalWeightedValue = 0;
    let totalWeight = 0;

    for (const conviction of convictions) {
      const weightedValue = conviction.value * conviction.weight;
      totalWeightedValue += weightedValue;
      totalWeight += conviction.weight;
    }

    const consensus = totalWeight > 0 ? (totalWeightedValue / totalWeight) : 0;
    
    // Normalize to 0-100 scale (from -100 to 100)
    const normalizedConsensus = ((consensus + 100) / 2);

    // Update signal consensus
    await tx.signal.update({
      where: { id: signalId },
      data: {
        consensus: normalizedConsensus,
      },
    });
  }
}