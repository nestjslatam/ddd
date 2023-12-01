import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

import { AbstractRepository } from '../../../shared';
import { SingerTable, SongTable } from '../../../database/tables';
import { SongRepository } from './song.repository';

@Injectable()
export class SingerRepository extends AbstractRepository<SingerTable> {
  constructor(
    @InjectRepository(SingerTable)
    readonly repository: Repository<SingerTable>,
    @InjectMapper() readonly mapper: Mapper,
    private readonly songRepsitory: SongRepository,
  ) {
    super(repository);
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
