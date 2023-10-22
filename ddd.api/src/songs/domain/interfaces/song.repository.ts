/* eslint-disable @typescript-eslint/no-empty-interface */
import { IRepository } from '../../../shared/domain';
import { SongTable } from '../../../database/tables';
import { Song } from '../song';

export interface ISongRepository extends IRepository<Song, SongTable> {
  findAllByAlbumId(albumId: string): Promise<SongTable[]>;
  findAllByArtistId(artistId: string): Promise<SongTable[]>;
}
