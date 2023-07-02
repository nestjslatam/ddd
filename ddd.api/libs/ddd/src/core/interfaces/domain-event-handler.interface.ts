import { IDomainEvent } from './domain-event.interface';

export interface IDomainEventHandler<T extends IDomainEvent = any> {
  handle(domainEvent: T): any;
}
