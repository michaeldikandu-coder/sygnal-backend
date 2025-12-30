import { Module } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { FeedsController } from './feeds.controller';
import { SignalsModule } from '../signals/signals.module';
import { PolymarketModule } from '../polymarket/polymarket.module';

@Module({
  imports: [SignalsModule, PolymarketModule],
  controllers: [FeedsController],
  providers: [FeedsService],
  exports: [FeedsService],
})
export class FeedsModule {}