import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('signals')
  async searchSignals(@Query('q') query: string, @Query('filters') filters?: string) {
    return this.searchService.searchSignals(query, filters);
  }

  @Get('users')
  async searchUsers(@Query('q') query: string) {
    return this.searchService.searchUsers(query);
  }

  @Get('topics')
  async searchTopics(@Query('q') query: string) {
    return this.searchService.searchTopics(query);
  }
}