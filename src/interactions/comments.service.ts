import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async createComment(
    userId: string,
    signalId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const { content, parentId } = createCommentDto;

    // Verify signal exists
    const signal = await this.prisma.signal.findUnique({
      where: { id: signalId },
    });

    if (!signal) {
      throw new NotFoundException('Signal not found');
    }

    // If parentId is provided, verify parent comment exists and belongs to same signal
    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.signalId !== signalId) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        signalId,
        userId,
        content,
        parentId,
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
            replies: true,
          },
        },
      },
    });

    return comment;
  }

  async getSignalComments(signalId: string) {
    // Get top-level comments (no parent)
    const comments = await this.prisma.comment.findMany({
      where: {
        signalId,
        parentId: null,
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
        replies: {
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
                replies: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
          take: 5, // Limit nested replies
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return comments;
  }
}