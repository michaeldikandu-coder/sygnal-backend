import { Module } from '@nestjs/common';
import { DiscoverController } from './discover.controller';
import { TrendingModule } from '../trending/trending.module';

@Module({
  imports: [TrendingModule],
  controllers: [DiscoverController],
})
export class DiscoverModule {}