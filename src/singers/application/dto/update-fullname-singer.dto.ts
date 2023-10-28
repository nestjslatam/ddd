import { IsNotEmpty } from 'class-validator';

export class UpdateFullNameSingerDto {
  @IsNotEmpty()
  newFullName: string;
}
