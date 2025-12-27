import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getTrendingTopics() {
    return this.prisma.topic.findMany({
      where: { trending: true },
      orderBy: { momentum: 'desc' },
      take: 20,
    });
  }
}