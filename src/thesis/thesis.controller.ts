import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ThesisService } from './thesis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateThesisDto } from './dto/create-thesis.dto';

@Controller()
export class ThesisController {
  constructor(private readonly thesisService: ThesisService) {}

  @Post('signals/:signalId/thesis')
  @UseGuards(JwtAuthGuard)
  async createThesis(
    @Request() req,
    @Param('signalId') signalId: string,
    @Body() createThesisDto: CreateThesisDto,
  ) {
    return this.thesisService.createThesis(signalId, createThesisDto);
  }

  @Get('signals/:signalId/thesis')
  async getSignalThesis(@Param('signalId') signalId: string) {
    return this.thesisService.getSignalThesis(signalId);
  }

  @Put('thesis/:thesisId/click')
  async trackThesisClick(@Param('thesisId') thesisId: string) {
    return this.thesisService.trackClick(thesisId);
  }
}