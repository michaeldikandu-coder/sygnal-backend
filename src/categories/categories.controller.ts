import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('categories')
  async getCategories() {
    return this.categoriesService.getCategories();
  }

  @Get('topics/trending')
  async getTrendingTopics() {
    return this.categoriesService.getTrendingTopics();
  }
}