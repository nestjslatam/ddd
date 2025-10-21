import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IDomainReadRepository,
  IDomainWriteRepository,
} from '@nestjslatam/ddd-lib';

import { SingerTable, SongTable } from '../db/tables';
import { Singer, Song } from '../../domain';
import { DatabaseException } from '../../../shared/exceptions';
import { SingerMapper, SongMapper } from '../mappers';

@Injectable()
export class SingerRepository
  implements
    IDomainReadRepository<string, Singer>,
    IDomainWriteRepository<string, Singer>
{
  constructor(
    @InjectRepository(SingerTable)
    readonly repository: Repository<SingerTable>,
    @InjectRepository(SongTable)
    readonly repositorySong: Repository<SongTable>,
  ) {}

  async find(): Promise<Singer[]> {
    const result = await this.repository.find({
      relations: ['songs'],
    });

    return result.map((s) => SingerMapper.toDomain(s));
  }

  async findById(id: string): Promise<Singer> {
    const result = await this.repository.findOneBy({ id });

    return SingerMapper.toDomain(result);
  }

  async exists(fullName: string): Promise<boolean> {
    try {
      const result = await this.repository.findOneBy({ fullName });

      return !!result;
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async insert(singer: Singer): Promise<void> {
    const table = SingerMapper.toTable(singer);

    await this.repository.save(table);
  }

  async insertBatch(entities: Singer[]): Promise<void> {
    const tables = entities.map((s) => SingerMapper.toTable(s));

    await this.repository.save(tables);
  }

  async update(id: string, singer: Singer): Promise<void> {
    const table = SingerMapper.toTable(singer);

    await this.repository.update(id, table);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async addSong(parent: Singer, song: Song): Promise<void> {
    const songTable = SongMapper.toTable(song);
    const parentTable = SingerMapper.toTable(parent);

    this.repositorySong.save(songTable);
    this.repository.save(parentTable);
  }

  async removeSong(parent: Singer, song: Song): Promise<void> {
    const songTable = SongMapper.toTable(song);

    this.repository.manager.transaction(async (manager) => {
      const singer = await manager.findOneBy(SingerTable, {
        id: parent.id,
      });

      singer.songs = singer.songs.filter((s) => s.id !== songTable.id);

      await manager.save(singer);

      await manager.delete(SongTable, songTable.id);
    });
  }
}
