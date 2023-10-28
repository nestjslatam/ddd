import { IsNotEmpty } from 'class-validator';

export class UpdateLyricSongDto {
  @IsNotEmpty()
  newLyric: string;
}
