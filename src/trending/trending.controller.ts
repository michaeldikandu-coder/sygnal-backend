import { Controller, Get, Query } from '@nestjs/common';
import { TrendingService } from './trending.service';

@Controller('trending')
export class TrendingController {
  constructor(private readonly trendingService: TrendingService) {}

  @Get('signals')
  async getTrendingSignals() {
    return this.trendingService.getTrendingSignals();
  }

  @Get('narratives')
  async getTrendingNarratives() {
    return this.trendingService.getTrendingNarratives();
  }

  @Get('users')
  async getTrendingUsers() {
    return this.trendingService.getTrendingUsers();
  }
}