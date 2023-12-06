import { IsNotEmpty, IsString } from 'class-validator';

export class AddSongToSingerDto {
  @IsNotEmpty()
  @IsString()
  songName: string;
  @IsString()
  trackingId?: string;
}
