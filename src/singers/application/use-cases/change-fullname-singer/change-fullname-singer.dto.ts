import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeFullNameSingerDto {
  @IsNotEmpty()
  newFullName: string;
  @IsString()
  trackingId?: string;
}
