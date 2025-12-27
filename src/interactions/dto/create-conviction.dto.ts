import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConvictionDto {
  @ApiProperty({
    description: 'Conviction value indicating confidence and direction',
    minimum: -100,
    maximum: 100,
    example: 75,
  })
  @IsNumber()
  @Min(-100)
  @Max(100)
  value: number;
}