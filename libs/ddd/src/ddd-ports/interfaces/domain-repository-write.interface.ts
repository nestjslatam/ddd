import { DomainAggregateRoot } from '../../ddd-aggregate-root';
import { DomainEntity } from '../../ddd-entity';
import { Primitives } from '../../ddd-valueobject';

export interface IDomainWriteRepository<
  TKey extends Primitives,
  TDomain extends DomainAggregateRoot<any> | DomainEntity<any>,
> {
  insert(entity: TDomain): Promise<void>;
  insertBatch(entities: TDomain[]): Promise<void>;
  update(id: TKey, entity: TDomain): Promise<void>;
  delete(id: TKey): Promise<void>;
}
