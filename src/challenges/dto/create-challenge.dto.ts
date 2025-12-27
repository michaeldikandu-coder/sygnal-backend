import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateChallengeDto {
  @IsOptional()
  @IsString()
  targetId?: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  stakeAmount: number;
}