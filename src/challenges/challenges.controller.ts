import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { ResolveChallengeDto } from './dto/resolve-challenge.dto';

@Controller()
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post('signals/:signalId/challenge')
  @UseGuards(JwtAuthGuard)
  async createChallenge(
    @Request() req,
    @Param('signalId') signalId: string,
    @Body() createChallengeDto: CreateChallengeDto,
  ) {
    return this.challengesService.createChallenge(
      req.user.id,
      signalId,
      createChallengeDto,
    );
  }

  @Get('challenges/:challengeId')
  async getChallengeById(@Param('challengeId') challengeId: string) {
    return this.challengesService.getChallengeById(challengeId);
  }

  @Post('challenges/:challengeId/accept')
  @UseGuards(JwtAuthGuard)
  async acceptChallenge(
    @Request() req,
    @Param('challengeId') challengeId: string,
  ) {
    return this.challengesService.acceptChallenge(req.user.id, challengeId);
  }

  @Post('challenges/:challengeId/resolve')
  @UseGuards(JwtAuthGuard)
  async resolveChallenge(
    @Request() req,
    @Param('challengeId') challengeId: string,
    @Body() resolveChallengeDto: ResolveChallengeDto,
  ) {
    return this.challengesService.resolveChallenge(
      req.user.id,
      challengeId,
      resolveChallengeDto,
    );
  }
}