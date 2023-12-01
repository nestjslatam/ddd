import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveSongToSingerDto {
  @IsNotEmpty()
  @IsString()
  singerId: string;
  @IsNotEmpty()
  @IsString()
  songId: string;
  @IsString()
  trackingId?: string;
}
