import { FullName } from './../../domain/singers/fullname-field';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

import {
  AbstractRepository,
  DatabaseException,
  Paginated,
  PaginatedQueryParams,
} from '../../../shared';
import { SingerTable, SongTable } from '../../../database/tables';

@Injectable()
export class SingerRepository extends AbstractRepository<SingerTable> {
  protected tableName: string = 'singers';

  constructor(
    @InjectRepository(SingerTable)
    readonly repository: Repository<SingerTable>,
    @InjectMapper() readonly mapper: Mapper,
  ) {
    super(repository);
  }

  async findAll(query: PaginatedQueryParams): Promise<Paginated<SingerTable>> {
    try {
      const result = await this.repository.find({
        skip: query.offset,
        take: query.limit,
      });

      const resultPag = new Paginated({
        data: result,
        count: result.length,
        limit: query.limit,
        page: query.page,
      });

      return resultPag;
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async exists(fullName: string): Promise<boolean> {
    try {
      const result = await this.repository.findOneBy({ fullName });

      return !!result;
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async findByName(fullName: string): Promise<SingerTable> {
    try {
      const result = await this.repository.findOneBy({ fullName });

      return result;
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async addSong(singerId: string, song: SongTable): Promise<void> {
    this.repository.manager.transaction(async (manager) => {
      await manager.save(song);

      const singer = await manager.findOneBy(SingerTable, { id: singerId });

      singer.songs.push(song);

      await manager.save(singer);
    });
  }

  async removeSong(singerId: string, song: SongTable): Promise<void> {
    this.repository.manager.transaction(async (manager) => {
      const singer = await manager.findOneBy(SingerTable, { id: singerId });

      singer.songs = singer.songs.filter((s) => s.id !== song.id);

      await manager.save(singer);

      await manager.delete(SongTable, song.id);
    });
  }
}
