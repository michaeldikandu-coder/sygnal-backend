import { Module } from '@nestjs/common';
import { PolymarketService } from './polymarket.service';
import { PolymarketController } from './polymarket.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PolymarketController],
  providers: [PolymarketService],
  exports: [PolymarketService],
})
export class PolymarketModule {}