import { IsNotEmpty, IsString } from 'class-validator';

export class UploadPictureSingerDto {
  @IsNotEmpty()
  newUrlPath: string;
  @IsString()
  trackingId?: string;
}
