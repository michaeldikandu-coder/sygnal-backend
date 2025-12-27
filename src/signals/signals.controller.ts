import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { SignalsService } from './signals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSignalDto } from './dto/create-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';
import { RemixSignalDto } from './dto/remix-signal.dto';
import { FeedQueryDto } from './dto/feed-query.dto';

@ApiTags('Signals')
@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Get('feed')
  @ApiOperation({ 
    summary: 'Get signal feed',
    description: 'Retrieve paginated list of signals with filtering and sorting options'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20, max: 50)' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort order', enum: ['newest', 'momentum', 'consensus', 'participants'] })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Filter by timeframe' })
  @ApiQuery({ name: 'userId', required: false, description: 'Show feed for specific user\'s following' })
  @ApiResponse({ 
    status: 200, 
    description: 'Signal feed retrieved successfully',
    schema: {
      example: {
        signals: [{
          id: "64f8a1b2c3d4e5f6a7b8c9d0",
          content: "Will Bitcoin reach $100,000 by end of 2024?",
          topic: "Bitcoin Price Prediction",
          category: "Finance",
          consensus: 67.5,
          momentum: 23.8,
          participantCount: 156,
          user: {
            name: "John Doe",
            handle: "johndoe",
            credibilityScore: 75.5
          }
        }],
        pagination: {
          page: 1,
          limit: 20,
          total: 1250,
          totalPages: 63,
          hasNext: true,
          hasPrev: false
        }
      }
    }
  })
  async getFeed(@Query() feedQuery: FeedQueryDto) {
    return this.signalsService.getFeed(feedQuery);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create new signal',
    description: 'Create a new prediction signal (requires minimum credibility score)'
  })
  @ApiBody({ type: CreateSignalDto })
  @ApiResponse({ status: 201, description: 'Signal created successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Insufficient credibility score' })
  async createSignal(@Request() req, @Body() createSignalDto: CreateSignalDto) {
    return this.signalsService.createSignal(req.user.id, createSignalDto);
  }

  @Get(':signalId')
  @ApiOperation({ 
    summary: 'Get signal by ID',
    description: 'Retrieve detailed information about a specific signal'
  })
  @ApiParam({ name: 'signalId', description: 'Signal ID' })
  @ApiResponse({ status: 200, description: 'Signal details retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Signal not found' })
  async getSignalById(@Param('signalId') signalId: string) {
    return this.signalsService.getSignalById(signalId);
  }

  @Put(':signalId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update signal',
    description: 'Update signal content (only by signal creator, not if resolved)'
  })
  @ApiParam({ name: 'signalId', description: 'Signal ID' })
  @ApiBody({ type: UpdateSignalDto })
  @ApiResponse({ status: 200, description: 'Signal updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Not signal owner or signal is resolved' })
  @ApiNotFoundResponse({ description: 'Signal not found' })
  async updateSignal(
    @Request() req,
    @Param('signalId') signalId: string,
    @Body() updateSignalDto: UpdateSignalDto,
  ) {
    return this.signalsService.updateSignal(req.user.id, signalId, updateSignalDto);
  }

  @Delete(':signalId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Delete signal',
    description: 'Delete signal (only by signal creator)'
  })
  @ApiParam({ name: 'signalId', description: 'Signal ID' })
  @ApiResponse({ status: 200, description: 'Signal deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Not signal owner' })
  @ApiNotFoundResponse({ description: 'Signal not found' })
  async deleteSignal(@Request() req, @Param('signalId') signalId: string) {
    return this.signalsService.deleteSignal(req.user.id, signalId);
  }

  @Post(':signalId/remix')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Remix signal',
    description: 'Create a remix of existing signal with modified content'
  })
  @ApiParam({ name: 'signalId', description: 'Original signal ID' })
  @ApiBody({ type: RemixSignalDto })
  @ApiResponse({ status: 201, description: 'Signal remix created successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Insufficient credibility score' })
  @ApiNotFoundResponse({ description: 'Original signal not found' })
  async remixSignal(
    @Request() req,
    @Param('signalId') signalId: string,
    @Body() remixSignalDto: RemixSignalDto,
  ) {
    return this.signalsService.remixSignal(req.user.id, signalId, remixSignalDto);
  }

  @Get(':signalId/remixes')
  @ApiOperation({ 
    summary: 'Get signal remixes',
    description: 'Retrieve all remixes of a specific signal'
  })
  @ApiParam({ name: 'signalId', description: 'Signal ID' })
  @ApiResponse({ status: 200, description: 'Signal remixes retrieved successfully' })
  async getSignalRemixes(@Param('signalId') signalId: string) {
    return this.signalsService.getSignalRemixes(signalId);
  }

  @Post(':signalId/share')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Share signal',
    description: 'Share signal on social media platform'
  })
  @ApiParam({ name: 'signalId', description: 'Signal ID' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        platform: { 
          type: 'string', 
          example: 'twitter',
          description: 'Social media platform'
        } 
      } 
    } 
  })
  @ApiResponse({ status: 200, description: 'Signal shared successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
  @ApiNotFoundResponse({ description: 'Signal not found' })
  async shareSignal(
    @Request() req,
    @Param('signalId') signalId: string,
    @Body('platform') platform?: string,
  ) {
    return this.signalsService.shareSignal(req.user.id, signalId, platform);
  }
}