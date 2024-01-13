import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IDomainReadRepository,
  IDomainWriteRepository,
} from '@nestjslatam/ddd-lib';

import { SongTable } from '../db/tables';
import { Song } from '../../domain';
import { DatabaseException } from '../../../shared/exceptions';
import { SongMapper } from '../mappers';

@Injectable()
export class SongRepository
  implements
    IDomainReadRepository<string, Song>,
    IDomainWriteRepository<string, Song>
{
  constructor(
    @InjectRepository(SongTable)
    readonly repository: Repository<SongTable>,
  ) {}

  async find(): Promise<Song[]> {
    const result = await this.repository.find();

    return result.map((s) => SongMapper.toDomain(s));
  }

  async findById(id: string): Promise<Song> {
    const result = await this.repository.findOneBy({ id });

    return SongMapper.toDomain(result);
  }

  async exists(name: string): Promise<boolean> {
    try {
      const result = await this.repository.findOneBy({ name });

      return !!result;
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async insert(singer: Song): Promise<void> {
    const table = SongMapper.toTable(singer);

    await this.repository.save(table);
  }

  async insertBatch(entities: Song[]): Promise<void> {
    const tables = entities.map((s) => SongMapper.toTable(s));

    await this.repository.save(tables);
  }

  async update(id: string, singer: Song): Promise<void> {
    const table = SongMapper.toTable(singer);

    await this.repository.update(id, table);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
