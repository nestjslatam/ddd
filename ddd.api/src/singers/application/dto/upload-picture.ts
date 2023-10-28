import { IsNotEmpty } from 'class-validator';

export class UploadPictureDto {
  @IsNotEmpty()
  newUrlPath: string;
  @IsNotEmpty()
  trackingId: string;
}
