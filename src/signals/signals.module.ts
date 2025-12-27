import { Module } from '@nestjs/common';
// import { BullModule } from '@nestjs/bull';
import { SignalsController } from './signals.controller';
import { SignalsService } from './signals.service';
// import { MomentumProcessor } from './processors/momentum.processor';

@Module({
  imports: [
    // BullModule.registerQueue({
    //   name: 'momentum',
    // }),
  ],
  controllers: [SignalsController],
  providers: [SignalsService], // MomentumProcessor
  exports: [SignalsService],
})
export class SignalsModule {}