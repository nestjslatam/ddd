import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IDomainReadRepository,
  IDomainWriteRepository,
  Paginated,
  PaginatedQueryParams,
} from '@nestjslatam/ddd-lib';

import { SingerTable, SongTable } from '../../../database/tables';
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
  ) {}

  async find(): Promise<Singer[]> {
    const result = await this.repository.find();

    return result.map((s) => SingerMapper.toDomain(s));
  }

  async findById(id: string): Promise<Singer> {
    const result = await this.repository.findOneBy({ id });

    return SingerMapper.toDomain(result);
  }

  async findAll(query: PaginatedQueryParams): Promise<Paginated<Singer>> {
    const result = await this.repository.find({
      skip: query.offset,
      take: query.limit,
      relations: ['songs'],
    });

    const resultPag = new Paginated({
      data: result.map((s) => SingerMapper.toDomain(s)),
      count: result.length,
      limit: query.limit,
      page: query.page,
    });

    return resultPag;
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

  async addSong(singerId: string, song: Song): Promise<void> {
    const songTable = SongMapper.toTable(song);

    this.repository.manager.transaction(async (manager) => {
      await manager.save(songTable);

      const singer = await manager.findOneBy(SingerTable, { id: singerId });

      singer.songs.push(songTable);

      await manager.save(singer);
    });
  }

  async removeSong(singerId: string, song: Song): Promise<void> {
    const songTable = SongMapper.toTable(song);

    this.repository.manager.transaction(async (manager) => {
      const singer = await manager.findOneBy(SingerTable, { id: singerId });

      singer.songs = singer.songs.filter((s) => s.id !== songTable.id);

      await manager.save(singer);

      await manager.delete(SongTable, songTable.id);
    });
  }
}
