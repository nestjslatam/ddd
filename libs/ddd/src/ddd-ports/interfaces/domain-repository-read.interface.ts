import { DomainAggregateRoot } from '../../ddd-aggregate-root';
import { DomainEntity } from '../../ddd-entity';
import { Primitives } from '../../ddd-valueobject';
import { Paginated, PaginatedQueryParams } from '../../ddd-core';

export interface IDomainReadRepository<
  TKey extends Primitives,
  TDomain extends DomainAggregateRoot<any> | DomainEntity<any>,
> {
  find(): Promise<TDomain[]>;
  findAll(params: PaginatedQueryParams): Promise<Paginated<TDomain>>;
  findById(id: TKey): Promise<TDomain>;
}
