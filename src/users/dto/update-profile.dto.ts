import { IsString, IsOptional, MinLength, MaxLength, Matches, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Handle can only contain letters, numbers, and underscores',
  })
  handle?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;
}