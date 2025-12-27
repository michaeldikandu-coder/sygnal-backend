import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get('search')
  async searchUsers(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }

  @Get(':userId')
  async getUserById(@Param('userId') userId: string) {
    return this.usersService.getUserById(userId);
  }

  @Post('follow/:userId')
  @UseGuards(JwtAuthGuard)
  async followUser(@Request() req, @Param('userId') userId: string) {
    return this.usersService.followUser(req.user.id, userId);
  }

  @Delete('unfollow/:userId')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(@Request() req, @Param('userId') userId: string) {
    return this.usersService.unfollowUser(req.user.id, userId);
  }

  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: string) {
    return this.usersService.getFollowers(userId);
  }

  @Get('following/:userId')
  async getFollowing(@Param('userId') userId: string) {
    return this.usersService.getFollowing(userId);
  }

  @Get(':userId/stats')
  async getUserStats(@Param('userId') userId: string) {
    return this.usersService.getUserStats(userId);
  }

  @Get(':userId/credibility-history')
  async getCredibilityHistory(@Param('userId') userId: string) {
    return this.usersService.getCredibilityHistory(userId);
  }

  @Get(':userId/predictions')
  async getUserPredictions(@Param('userId') userId: string) {
    return this.usersService.getUserPredictions(userId);
  }

  @Get(':userId/challenges')
  async getUserChallenges(@Param('userId') userId: string) {
    return this.usersService.getUserChallenges(userId);
  }
}