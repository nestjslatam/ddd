import { DomainAggregateRoot } from '../../ddd-aggregate-root';
import { DomainEntity } from '../../ddd-entity';
import { Primitives } from '../../ddd-valueobject';

export interface IDomainReadRepository<
  TKey extends Primitives,
  TDomain extends DomainAggregateRoot<any> | DomainEntity<any>,
> {
  find(): Promise<TDomain[]>;
  findById(id: TKey): Promise<TDomain>;
}
