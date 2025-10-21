import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePictureSingerDto {
  @IsNotEmpty()
  @IsString()
  newPicture: string;
  @IsString()
  trackingId?: string;
}
