import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeFullNameSingerDto {
  @IsNotEmpty()
  @IsString()
  singerId: string;
  @IsNotEmpty()
  @IsString()
  newFullName: string;
  @IsString()
  trackingId?: string;
}
