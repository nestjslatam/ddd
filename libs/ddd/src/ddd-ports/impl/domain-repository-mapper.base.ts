import { ObjectLiteral } from 'typeorm';

import { DomainAggregateRoot } from '../../ddd-aggregate-root';
import { DomainEntity } from '../../ddd-entity';

export abstract class AsbtractDomainRepositoryMapper<
  TDomain extends DomainAggregateRoot<any> | DomainEntity<any>,
  TTable extends ObjectLiteral | any,
> {
  abstract toDomain(table: TTable): TDomain;
  abstract toTable(domain: TDomain): TTable;
}
