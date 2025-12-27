import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateSignalDto {
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  topic?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  timeframe?: string;
}