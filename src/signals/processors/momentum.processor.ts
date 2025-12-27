import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('momentum')
export class MomentumProcessor {
  constructor(private prisma: PrismaService) {}

  @Process('calculateMomentum')
  async handleMomentumCalculation(job: Job) {
    const { signalId } = job.data;

    // Get signal with convictions from last 24 hours
    const signal = await this.prisma.signal.findUnique({
      where: { id: signalId },
      include: {
        convictions: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        },
      },
    });

    if (!signal) {
      return;
    }

    // Calculate momentum based on:
    // 1. Number of recent convictions
    // 2. Weighted by user credibility
    // 3. Time decay factor

    let momentum = 0;
    const now = Date.now();

    for (const conviction of signal.convictions) {
      const ageInHours = (now - conviction.createdAt.getTime()) / (1000 * 60 * 60);
      const timeDecay = Math.exp(-ageInHours / 12); // Decay over 12 hours
      const weightedValue = Math.abs(conviction.value) * conviction.weight * timeDecay;
      momentum += weightedValue;
    }

    // Normalize momentum (0-100 scale)
    momentum = Math.min(momentum / 10, 100);

    // Update signal momentum
    await this.prisma.signal.update({
      where: { id: signalId },
      data: { momentum },
    });

    return { signalId, momentum };
  }
}