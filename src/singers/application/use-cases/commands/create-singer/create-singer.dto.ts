import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSingerDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;
  @IsNotEmpty()
  @IsString()
  picture: string;
  @IsString()
  trackingId?: string;
}
