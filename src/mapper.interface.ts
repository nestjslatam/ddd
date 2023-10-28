import { DomainEntity } from '@nestjslatam/ddd';

export interface Mapper<
  Entity extends DomainEntity<any>,
  DbRecord,
  Response = any,
> {
  toTable(entity: Entity): DbRecord;
  toEntity(record: any): Entity;
  toResult(entity: Entity): Response;
}
