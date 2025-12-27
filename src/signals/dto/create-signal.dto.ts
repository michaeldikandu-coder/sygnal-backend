import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSignalDto {
  @ApiProperty({
    description: 'Signal content/prediction text',
    example: 'Will Tesla stock reach $300 by Q2 2024?',
    minLength: 10,
    maxLength: 500
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  content: string;

  @ApiProperty({
    description: 'Signal topic/title',
    example: 'Tesla Stock Prediction',
    maxLength: 100,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  topic?: string;

  @ApiProperty({
    description: 'Signal category',
    example: 'Finance',
    maxLength: 50,
    enum: ['Technology', 'Finance', 'Politics', 'Sports', 'Entertainment', 'Science']
  })
  @IsString()
  @MaxLength(50)
  category: string;

  @ApiProperty({
    description: 'Prediction timeframe',
    example: '6m',
    maxLength: 50,
    required: false,
    enum: ['1h', '24h', '7d', '1m', '3m', '6m', '1y', '2y', '5y']
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timeframe?: string;
}