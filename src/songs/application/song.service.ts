import { Injectable } from '@nestjs/common';

import { Lyric } from './../domain/lyrics';
import { SongRepository } from '../infraestructure/db';
import { Song, eSongStatus } from '../domain/song';
import { CreateSongDto } from './dto/create-song.dto';
import { Description } from '../domain/description';
import { Id, Name, Url } from '../../shared/domain';
import { SongTable } from 'src/database/tables';
import { SongSinger } from '../domain/song-singer';
import { SongInfoDto } from './dto/song-info.dto';

@Injectable()
export class SongService {
  constructor(private readonly repository: SongRepository) {}

  async findOneById(id: string): Promise<SongInfoDto> {
    const songTable = await this.repository.findOneById(id);

    return await this.mapInfoFromTable([songTable])[0];
  }

  async findAllBySingerId(artistId: string): Promise<SongInfoDto[]> {
    const songTables = await this.repository.findAllBySingerId(artistId);

    return await this.mapInfoFromTable(songTables);
  }

  async create(createSongDto: CreateSongDto) {
    const { name, artist, description, lyric, url } = createSongDto;

    const song = Song.create({
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
    const songEntity = await this.mapEntityFromTable(songId);

    songEntity.changeName(Name.create(newName));

    await this.repository.update(songId, songEntity);
  }

  async uploadLyric(songId: string, newLyric: string): Promise<void> {
    const songEntity = await this.mapEntityFromTable(songId);

    songEntity.uploadLyric(Lyric.create(newLyric));

    await this.repository.update(songId, songEntity);
  }

  async setDraft(songId: string): Promise<void> {
    const songEntity = await this.mapEntityFromTable(songId);

    songEntity.setDraft();

    await this.repository.update(songId, songEntity);
  }

  async setPublish(songId: string): Promise<void> {
    const songEntity = await this.mapEntityFromTable(songId);

    songEntity.setPublish();

    await this.repository.update(songId, songEntity);
  }

  async update(
    songId: string,
    { url, description }: { url: string; description: string },
  ): Promise<void> {
    const songEntity = await this.mapEntityFromTable(songId);

    songEntity.update(Description.create(description), Url.create(url));

    return await this.repository.update(songId, songEntity);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }

  private async mapInfoFromTable(
    songTables: SongTable[],
  ): Promise<SongInfoDto[]> {
    const songInfos: SongInfoDto[] = [];

    songTables.map((song) => {
      const { id, singer, name, description, url, lyric, status } = song;

      songInfos.push(
        new SongInfoDto(
          id,
          name,
          description,
          { id: singer.id, name: singer.fullName },
          url,
          lyric,
          status,
        ),
      );
    });

    return songInfos;
  }

  async mapEntityFromTable(songId: string): Promise<Song> {
    const { id, name, description, url, lyric, status, singer } =
      await this.findOneById(songId);

    return Song.load({
      id,
      singer: { id: singer.id, name: singer.name },
      name,
      description,
      url,
      lyric,
      status,
    });
  }
}
