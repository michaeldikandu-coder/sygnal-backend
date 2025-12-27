import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { FeedsModule } from '../feeds/feeds.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    FeedsModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}