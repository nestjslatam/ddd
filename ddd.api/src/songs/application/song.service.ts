import { Lyric } from './../domain/lyrics';
import { Injectable } from '@nestjs/common';

import { SongRepository } from '../infraestructure/db';
import { Song, eSongStatus } from '../domain/song';
import { CreateSongDto } from './dto/create-song.dto';
import { Description } from '../domain/description';
import { Id, Name, Url } from '../../shared/domain';
import { SongTable } from 'src/database/tables';
import { SongSinger } from '../domain/song-singer';

@Injectable()
export class SongService {
  constructor(private readonly repository: SongRepository) {}

  async findOneById(id: string): Promise<Song> {
    const songTables: SongTable[] = [];

    songTables.push(await this.repository.findOneById(id));

    return await this.mapFromTable(songTables)[0];
  }

  async findAllByAlbumId(albumId: string): Promise<Song[]> {
    const songTables = await this.repository.findAllByAlbumId(albumId);

    return await this.mapFromTable(songTables);
  }

  async findAllByArtistId(artistId: string): Promise<Song[]> {
    const songTables = await this.repository.findAllByArtistId(artistId);

    return await this.mapFromTable(songTables);
  }

  async create(createSongDto: CreateSongDto) {
    const { name, artist, description, lyric, url } = createSongDto;

    const song = Song.create({
      id: Id.create(),
      singer: SongSinger.create(Id.load(artist.id), Name.create(artist.name)),
      name: Name.create(name),
      description: Description.create(description),
      url: Url.create(url),
      lyric: Lyric.create(lyric),
      status: eSongStatus.CREATED,
    });

    return await this.repository.create(song);
  }

  async changeName(songId: string, newName: string): Promise<void> {
    const song = await this.findOneById(songId);

    song.getPropsCopy().name = Name.create(newName);

    await this.repository.update(songId, song);
  }

  async uploadLyric(songId: string, newLyric: string): Promise<void> {
    const song = await this.findOneById(songId);

    song.getPropsCopy().lyric = Lyric.create(newLyric);

    await this.repository.update(songId, song);
  }

  async setDraft(songId: string): Promise<void> {
    const song = await this.findOneById(songId);

    song.setDraft();

    await this.repository.update(songId, song);
  }

  async setPublish(songId: string): Promise<void> {
    const song = await this.findOneById(songId);

    song.setPublish();

    await this.repository.update(songId, song);
  }

  async update(
    id: string,
    { url, description }: { url: string; description: string },
  ): Promise<void> {
    const song = await this.findOneById(id);

    song.update(Description.create(description), Url.create(url));

    return await this.repository.update(id, song);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }

  private async mapFromTable(songTables: SongTable[]): Promise<Song[]> {
    const songEntities: Song[] = [];

    songTables.map((songTable) => {
      const { id, singer, name, description, url, lyric, status } = songTable;

      songEntities.push(
        Song.load({
          id,
          singer: { id: singer.id, name: singer.fullName },
          name,
          description,
          url,
          lyric,
          status,
        }),
      );
    });

    return songEntities;
  }
}
