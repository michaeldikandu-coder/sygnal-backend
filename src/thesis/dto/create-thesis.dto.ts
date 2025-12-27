import { IsUrl } from 'class-validator';

export class CreateThesisDto {
  @IsUrl()
  url: string;
}