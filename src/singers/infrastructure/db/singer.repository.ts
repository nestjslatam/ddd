import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IDomainReadRepository,
  IDomainWriteRepository,
  BrokenRulesException,
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
    if (!id || id.trim() === '') {
      throw new DatabaseException('Singer ID cannot be empty');
    }

    const result = await this.repository.findOneBy({ id });

    if (!result) {
      throw new DatabaseException(`Singer with ID ${id} not found`);
    }

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
    if (!singer) {
      throw new DatabaseException('Cannot insert null singer');
    }

    if (!singer.IsValid) {
      throw new BrokenRulesException(
        `Cannot insert invalid singer: ${singer.BrokenRules.asString()}`,
      );
    }

    try {
      const table = SingerMapper.toTable(singer);
      await this.repository.save(table);
    } catch (error) {
      throw new DatabaseException(`Failed to insert singer: ${error.message}`);
    }
  }

  async insertBatch(entities: Singer[]): Promise<void> {
    const tables = entities.map((s) => SingerMapper.toTable(s));

    await this.repository.save(tables);
  }

  async update(id: string, singer: Singer): Promise<void> {
    if (!id || !singer) {
      throw new DatabaseException('ID and singer are required');
    }

    if (!singer.IsValid) {
      throw new BrokenRulesException(
        `Cannot update with invalid singer: ${singer.BrokenRules.asString()}`,
      );
    }

    try {
      const table = SingerMapper.toTable(singer);
      const result = await this.repository.update(id, table);

      if (result.affected === 0) {
        throw new DatabaseException(
          `Singer with ID ${id} not found for update`,
        );
      }
    } catch (error) {
      if (
        error instanceof DatabaseException ||
        error instanceof BrokenRulesException
      ) {
        throw error;
      }
      throw new DatabaseException(
        `Failed to update singer ${id}: ${error.message}`,
      );
    }
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async addSong(parent: Singer, song: Song): Promise<void> {
    if (!parent || !song) {
      throw new DatabaseException('Parent and song are required');
    }

    const songTable = SongMapper.toTable(song);
    const parentTable = SingerMapper.toTable(parent);

    // Use transaction to ensure atomicity
    await this.repository.manager.transaction(async (manager) => {
      await manager.save(SongTable, songTable);
      await manager.save(SingerTable, parentTable);
    });
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
