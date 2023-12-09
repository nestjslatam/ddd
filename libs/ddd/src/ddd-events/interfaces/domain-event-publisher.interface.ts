import { IDomainEvent } from './domain-event.interface';

export interface IDomainEventPublisher<
  DomainEventBase extends IDomainEvent = IDomainEvent,
> {
  publish<T extends DomainEventBase = DomainEventBase>(
    domainEvent: T,
    context?: unknown,
  ): any;
  publishAll?<T extends DomainEventBase = DomainEventBase>(
    domainEvents: T[],
    context?: unknown,
  ): any;
}
