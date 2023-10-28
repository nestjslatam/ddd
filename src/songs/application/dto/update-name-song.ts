import { IsNotEmpty } from 'class-validator';

export class UpdateNameSongDto {
  @IsNotEmpty()
  newName: string;
}
