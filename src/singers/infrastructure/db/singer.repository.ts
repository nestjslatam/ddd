import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DatabaseException } from '../../../shared/exceptions';
import { ISingerRepository } from '../../domain/interfaces';
import { SingerTable } from '../../../database/tables';
import { Singer } from '../../domain/singer';

@Injectable()
export class SingerRepository implements ISingerRepository {
  constructor(
    @InjectRepository(SingerTable)
    private readonly repository: Repository<SingerTable>,
  ) {}

  async findAll(): Promise<SingerTable[]> {
    return await this.repository.find();
  }

  async findOneById(id: string): Promise<SingerTable> {
    try {
      return this.repository.findOneBy({ id });
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async create(item: Singer): Promise<void> {
    if (item === null || item === undefined)
      throw new DatabaseException("item can't be null or undefined");

    const {
      fullName,
      picture,
      registerDate,
      isSubscribed,
      subscribedDate,
      status,
    } = item.getPropsCopy();

    const songTable = new SingerTable();

    songTable.id = item.getId();
    songTable.fullName = fullName.unpack();
    songTable.picture = picture ? picture.unpack() : 'default';
    songTable.registerDate = registerDate ? registerDate.unpack() : null;
    songTable.isSubscribed = isSubscribed;
    songTable.subscribedDate = subscribedDate ? subscribedDate.unpack() : null;
    songTable.status = status;
    songTable.audit = { ...item.getAudit().unpack() };

    try {
      await this.repository.save(songTable);
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async update(id: string, entity: Singer): Promise<void> {
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
