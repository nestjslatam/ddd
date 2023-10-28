import { IDomainEvent } from '@nestjslatam/ddd';

export interface IDomainEventPublisher<
  DomainEventBase extends IDomainEvent = IDomainEvent,
> {
  publish<T extends DomainEventBase = DomainEventBase>(domainEvent: T): any;
  publishAll?<T extends DomainEventBase = DomainEventBase>(
    domainEvents: T[],
  ): any;
}
