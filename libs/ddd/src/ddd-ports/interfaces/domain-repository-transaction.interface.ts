import { DomainAggregateRoot } from '../../ddd-aggregate-root';
import { DomainEntity } from '../../ddd-entity';

export interface IDomainTransationRepository<
  TDomain extends DomainAggregateRoot<any> | DomainEntity<any>,
> {
  publishEvents(
    domainEntity: TDomain,
    handler: () => Promise<void>,
  ): Promise<void>;

  transaction<T>(handler: () => Promise<T>): Promise<T>;
}
