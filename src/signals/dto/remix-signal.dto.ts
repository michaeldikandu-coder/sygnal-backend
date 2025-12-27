import { IsString, MinLength, MaxLength } from 'class-validator';

export class RemixSignalDto {
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  content: string;
}