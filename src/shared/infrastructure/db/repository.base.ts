import { Repository } from 'typeorm';
import {
  DomainAggregateRoot,
  DomainEntity,
  IDomainReadRepository,
  IDomainWriteRepository,
} from '@nestjslatam/ddd-lib';

import { DatabaseException } from '../../exceptions';
import { Paginated, PaginatedQueryParams } from '../../application';

export abstract class AbstractRepository<
    TDomain extends DomainEntity<any> | DomainAggregateRoot<any>,
  >
  implements
    IDomainReadRepository<string, TDomain>,
    IDomainWriteRepository<string, TDomain>
{
  protected abstract tableName: string;

  constructor(protected readonly repository: Repository<TDomain>) {}

  abstract findAll(params: PaginatedQueryParams): Promise<Paginated<TDomain>>;

  async find(): Promise<TDomain[]> {
    try {
      return await this.repository.find();
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async findById(id: any): Promise<TDomain> {
    try {
      const data = await this.repository.findOneBy(id);

      return data;
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async insert(entity: TDomain): Promise<void> {
    try {
      await this.repository.insert(entity);
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async insertBatch(entities: TDomain[]): Promise<void> {
    try {
      await this.repository.insert(entities);
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async update(id: TKey, entity: TDomain): Promise<void> {
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
