import { IsNotEmpty, IsString } from 'class-validator';

export class UploadPictureDto {
  @IsNotEmpty()
  newUrlPath: string;
  @IsString()
  trackingId?: string;
}
