import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class CreateSongDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  artist: { id: string; name: string };
  @IsString()
  @IsEmpty()
  description: string;
  @IsString()
  @IsEmpty()
  lyric: string;
  @IsString()
  @IsEmpty()
  url: string;
}
