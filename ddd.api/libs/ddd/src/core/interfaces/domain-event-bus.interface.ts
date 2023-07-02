import { IDomainEvent } from './domain-event.interface';

export interface IDomainEventBus<
  TDomainEvent extends IDomainEvent = IDomainEvent,
> {
  publish<T extends TDomainEvent>(domainEvent: T);

  publishAll(domainEvents: TDomainEvent[]);
}
