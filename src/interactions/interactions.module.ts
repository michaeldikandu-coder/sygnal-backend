import { Module } from '@nestjs/common';
// import { BullModule } from '@nestjs/bull';
import { InteractionsController } from './interactions.controller';
import { ConvictionService } from './conviction.service';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    // BullModule.registerQueue({
    //   name: 'momentum',
    // }),
  ],
  controllers: [InteractionsController],
  providers: [ConvictionService, CommentsService],
  exports: [ConvictionService, CommentsService],
})
export class InteractionsModule {}