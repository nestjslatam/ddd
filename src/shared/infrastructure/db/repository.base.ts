import { ObjectLiteral, Repository } from 'typeorm';
import {
  IDomainReadRepository,
  IDomainWriteRepository,
} from '@nestjslatam/ddd-lib';

import { DatabaseException } from '../../exceptions';
import { Paginated, PaginatedQueryParams } from '../../application';

export abstract class AbstractRepository<TTable extends ObjectLiteral>
  implements
    IDomainReadRepository<string, TTable>,
    IDomainWriteRepository<string, TTable>
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
      return await this.repository.findOne(id);
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
