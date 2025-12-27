import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CredibilityService } from './credibility.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('credibility')
export class CredibilityController {
  constructor(private readonly credibilityService: CredibilityService) {}

  @Get('leaderboard')
  async getLeaderboard() {
    return this.credibilityService.getLeaderboard();
  }

  @Get('user/:userId/score')
  async getUserScore(@Param('userId') userId: string) {
    return this.credibilityService.getUserScore(userId);
  }

  @Post('stake')
  @UseGuards(JwtAuthGuard)
  async stakeCredibility(@Request() req, @Body('amount') amount: number) {
    return this.credibilityService.stakeCredibility(req.user.id, amount);
  }

  @Get('transactions/:userId')
  async getTransactions(@Param('userId') userId: string) {
    return this.credibilityService.getTransactions(userId);
  }
}