import { Controller, Post, Get } from '@nestjs/common';
import { FeedsService } from './feeds.service';

@Controller('feeds')
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @Post('sync')
  async syncRealWorldEvents() {
    const signals = await this.feedsService.fetchAllRealWorldEvents();
    return {
      message: `Successfully synced ${signals.length} real-world events`,
      signals: signals.length,
    };
  }

  @Get('news')
  async getNewsEvents() {
    return this.feedsService.fetchNewsEvents();
  }

  @Get('financial')
  async getFinancialEvents() {
    return this.feedsService.fetchFinancialEvents();
  }

  @Get('sports')
  async getSportsEvents() {
    return this.feedsService.fetchSportsEvents();
  }

  @Get('sports/nba')
  async getNBAEvents() {
    return this.feedsService.fetchNBAEvents();
  }

  @Get('sports/football')
  async getFootballEvents() {
    return this.feedsService.fetchFootballEvents();
  }

  @Get('sports/espn')
  async getESPNEvents() {
    return this.feedsService.fetchESPNEvents();
  }

  @Get('crypto')
  async getCryptoEvents() {
    return this.feedsService.fetchCryptoEvents();
  }

  @Get('weather')
  async getWeatherEvents() {
    return this.feedsService.fetchWeatherEvents();
  }
}