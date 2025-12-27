import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ConvictionService } from './conviction.service';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateConvictionDto } from './dto/create-conviction.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Signal Interactions')
@Controller()
export class InteractionsController {
  constructor(
    private readonly convictionService: ConvictionService,
    private readonly commentsService: CommentsService,
  ) {}

  // Conviction endpoints
  @Post('signals/:signalId/conviction')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create or update conviction on a signal',
    description: 'Users can freely express their conviction on any signal without point restrictions'
  })
  @ApiParam({ name: 'signalId', description: 'Signal ID' })
  @ApiResponse({ status: 201, description: 'Conviction created/updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid conviction value or signal is resolved' })
  @ApiResponse({ status: 404, description: 'Signal not found' })
  async createConviction(
    @Request() req,
    @Param('signalId') signalId: string,
    @Body() createConvictionDto: CreateConvictionDto,
  ) {
    return this.convictionService.createConviction(
      req.user.id,
      signalId,
      createConvictionDto,
    );
  }

  @Get('signals/:signalId/conviction')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user\'s conviction on a signal' })
  @ApiParam({ name: 'signalId', description: 'Signal ID' })
  @ApiResponse({ status: 200, description: 'User conviction retrieved' })
  @ApiResponse({ status: 404, description: 'Signal not found or no conviction exists' })
  async getUserConviction(
    @Request() req,
    @Param('signalId') signalId: string,
  ) {
    return this.convictionService.getUserConviction(req.user.id, signalId);
  }

  // Comments endpoints
  @Post('signals/:signalId/comment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment to a signal' })
  @ApiParam({ name: 'signalId', description: 'Signal ID' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 404, description: 'Signal not found' })
  async createComment(
    @Request() req,
    @Param('signalId') signalId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(
      req.user.id,
      signalId,
      createCommentDto,
    );
  }

  @Get('signals/:signalId/comments')
  @ApiOperation({ summary: 'Get all comments for a signal' })
  @ApiParam({ name: 'signalId', description: 'Signal ID' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  async getSignalComments(@Param('signalId') signalId: string) {
    return this.commentsService.getSignalComments(signalId);
  }
}