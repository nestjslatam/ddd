import { ObjectLiteral, Repository } from 'typeorm';
import {
  IDomainReadRepository,
  IDomainWriteRepository,
} from '@nestjslatam/ddd-lib';

import { DatabaseException } from '../../exceptions';
import { Paginated, PaginatedQueryParams } from '../../application';

export abstract class AbstractRepository<TKey, TTable extends ObjectLiteral>
  implements
    IDomainReadRepository<TKey, TTable>,
    IDomainWriteRepository<TKey, TTable>
{
  protected abstract tableName: string;

  constructor(protected readonly repository: Repository<TTable>) {}

  abstract findAll(params: PaginatedQueryParams): Promise<Paginated<TTable>>;

  async find(): Promise<TTable[]> {
    try {
      return await this.repository.find();
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async findById(id: any): Promise<TTable> {
    try {
      const data = await this.repository.findOneBy(id);

      return data;
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

  async update(id: TKey, entity: TTable): Promise<void> {
    try {
      const found = await this.findById(id);

      if (!found) throw new DatabaseException(`Entity with id ${id} not found`);

      await this.repository.update(id as string, entity);
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async delete(id: TKey): Promise<void> {
    try {
      await this.repository.delete(id as string);
    } catch (error) {
      throw new DatabaseException(error);
    }
  }
}
