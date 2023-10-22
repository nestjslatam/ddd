import { CreateSongDto } from './create-song.dto';

export class UpdateSongDto extends CreateSongDto {
  status: 'created' | 'drafted' | 'published';
}
