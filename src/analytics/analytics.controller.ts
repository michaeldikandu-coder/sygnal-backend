import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('signal-performance/:signalId')
  async getSignalPerformance(@Param('signalId') signalId: string) {
    return this.analyticsService.getSignalPerformance(signalId);
  }

  @Get('user-accuracy/:userId')
  async getUserAccuracy(@Param('userId') userId: string) {
    return this.analyticsService.getUserAccuracy(userId);
  }

  @Get('market-sentiment')
  async getMarketSentiment() {
    return this.analyticsService.getMarketSentiment();
  }
}