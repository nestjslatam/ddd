import { ObjectLiteral, Repository } from 'typeorm';
import {
  IDomainReadRepository,
  IDomainWriteRepository,
} from '@nestjslatam/ddd-lib';

import { DatabaseException } from '../../exceptions';

export abstract class AbstractRepository<TTable extends ObjectLiteral>
  implements
    IDomainReadRepository<string, TTable>,
    IDomainWriteRepository<string, TTable>
{
  constructor(protected readonly repository: Repository<TTable>) {}

  async find(): Promise<TTable[]> {
    try {
      return await this.repository.find();
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async findById(id: any): Promise<TTable> {
    try {
      return await this.repository.findOne(id);
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async exists(
    id: string,
    value: string,
    entityName: string,
    parentId: string,
  ): Promise<boolean> {
    try {
      const found = await this.repository
        .createQueryBuilder(entityName)
        .select()
        .where(`${value} = :value`, { value })
        .andWhere(`${parentId} = :parentId`, { parentId })
        .getOne();

      if (!found) return false;

      return found.id !== id;
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async insert(entity: TTable): Promise<void> {
    try {
      await this.repository.insert(entity);
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async insertBatch(entities: TTable[]): Promise<void> {
    try {
      await this.repository.insert(entities);
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async update(id: string, entity: TTable): Promise<void> {
    try {
      const found = await this.findById(id);

      if (!found) throw new DatabaseException(`Entity with id ${id} not found`);

      await this.repository.update(id, entity);
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      throw new DatabaseException(error);
    }
  }
}
