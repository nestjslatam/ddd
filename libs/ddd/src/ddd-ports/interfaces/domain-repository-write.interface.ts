import { DomainAggregateRoot } from '../../ddd-aggregate-root';
import { DomainEntity } from '../../ddd-entity';
import { Primitives } from '../../ddd-valueobject';

export interface IDomainWriteRepository<
  TKey extends Primitives,
  TDomain extends DomainAggregateRoot<any> | DomainEntity<any>,
> {
  save(entity: TDomain | TDomain[]): Promise<TDomain | TDomain[]>;
  update(id: TKey, entity: TDomain): Promise<TDomain>;
  delete(id: TKey): Promise<TDomain>;
}
