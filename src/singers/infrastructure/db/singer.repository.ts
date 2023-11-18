import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DatabaseException } from '../../../shared/exceptions';
import { SingerTable } from '../../../database/tables';

import {
  ISingerReadRepository,
  ISingerWriteRepository,
} from 'src/singers/domain/interfaces/singer.repository';

@Injectable()
export class SingerRepository
  implements ISingerReadRepository, ISingerWriteRepository
{
  constructor(
    @InjectRepository(SingerTable)
    private readonly repository: Repository<SingerTable>,
  ) {}

  async fetchAll(): Promise<SingerTable[]> {
    return await this.repository.find();
  }

  async fetchById(id: string): Promise<SingerTable> {
    try {
      return this.repository.findOneBy({ id });
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async add(entity: SingerTable): Promise<void> {
    if (entity === null || entity === undefined)
      throw new DatabaseException("entity can't be null or undefined");

    try {
      await this.repository.save(entity);
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async addBatch(entities: SingerTable[]): Promise<void> {
    if (!entities && entities.length > 0)
      throw new DatabaseException("entity can't be null or undefined");

    try {
      await this.repository.save(entities);
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async update(id: string, entity: SingerTable): Promise<void> {
    const songToUpdate = await this.fetchById(id);

    if (!songToUpdate) throw new DatabaseException('song not found');

    try {
      const updatedSong = { ...songToUpdate, ...entity };
      await this.repository.save(updatedSong);
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
