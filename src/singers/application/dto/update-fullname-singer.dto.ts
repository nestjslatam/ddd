import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFullNameSingerDto {
  @IsNotEmpty()
  newFullName: string;
  @IsString()
  trackingId?: string;
}
