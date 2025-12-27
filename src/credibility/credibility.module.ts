import { Module } from '@nestjs/common';
import { CredibilityController } from './credibility.controller';
import { CredibilityService } from './credibility.service';

@Module({
  controllers: [CredibilityController],
  providers: [CredibilityService],
})
export class CredibilityModule {}