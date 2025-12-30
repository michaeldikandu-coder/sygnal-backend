import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { FeedsModule } from '../feeds/feeds.module';
import { PolymarketModule } from '../polymarket/polymarket.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    FeedsModule,
    PolymarketModule,
  ],
  providers: [SchedulerService],
  exports: [SchedulerService], // Export for use in other modules
})
export class SchedulerModule {}