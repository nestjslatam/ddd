import { IDomainEvent } from '@nestjslatam/ddd';

export interface IDomainEventHandler<T extends IDomainEvent = any> {
  handle(domainEvent: T): any;
}
