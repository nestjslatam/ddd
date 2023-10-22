import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DatabaseException } from '../../../shared/exceptions';
import { ISongRepository } from '../../domain/interfaces';
import { SongTable } from '../../../database/tables';
import { Song } from '../../domain/song';

@Injectable()
export class SongRepository implements ISongRepository {
  constructor(
    @InjectRepository(SongTable)
    private readonly repository: Repository<SongTable>,
  ) {}

  async findAllByAlbumId(albumId: string): Promise<SongTable[]> {
    try {
      return await this.repository
        .createQueryBuilder('song')
        .innerJoin('song.album', 'album', 'album.id = :albumId', {
          albumId,
        })
        .getMany();
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async findAllByArtistId(artistId: string): Promise<SongTable[]> {
    try {
      return await this.repository
        .createQueryBuilder('song')
        .innerJoin('song.artist', 'artist', 'artist.id = :artistId', {
          artistId,
        })
        .getMany();
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async findOneById(id: string): Promise<SongTable> {
    try {
      return this.repository.findOneBy({ id });
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async create(item: Song): Promise<void> {
    const { name, description, url, lyric, status } = item.getPropsCopy();

    const songTable = new SongTable();

    songTable.id = item.getId();
    songTable.name = name.unpack();
    songTable.description = description.unpack();
    songTable.url = url.unpack();
    songTable.lyric = lyric.unpack();
    songTable.status = status;
    songTable.audit = { ...item.getAudit().unpack() };

    try {
      await this.repository.save(songTable);
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async update(id: string, entity: Song): Promise<void> {
    const songToUpdate = await this.repository.preload({
      id,
      ...entity,
    });

    if (!songToUpdate) throw new DatabaseException('song not found');

    const { updatedAt, updatedBy } = entity.getAudit().unpack();

    songToUpdate.audit.updatedBy = updatedBy;
    songToUpdate.audit.updatedAt = updatedAt;

    try {
      await this.repository.save(songToUpdate);
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async delete(id: string): Promise<void> {
    const songToDelete = await this.repository.findOneBy({ id });

    if (!songToDelete) throw new DatabaseException('song not found');

    try {
      await this.repository.remove(songToDelete);
    } catch (error) {
      throw new DatabaseException(error);
    }
  }
}
