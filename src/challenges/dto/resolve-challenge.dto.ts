import { IsString } from 'class-validator';

export class ResolveChallengeDto {
  @IsString()
  winnerId: string;
}