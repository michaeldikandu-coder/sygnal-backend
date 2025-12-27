import { Controller, Get, Query } from '@nestjs/common';
import { TrendingService } from '../trending/trending.service';

@Controller('discover')
export class DiscoverController {
  constructor(private readonly trendingService: TrendingService) {}

  @Get('signals')
  async discoverSignals(
    @Query('category') category?: string,
    @Query('timeframe') timeframe?: string,
  ) {
    return this.trendingService.getDiscoverSignals(category, timeframe);
  }
}