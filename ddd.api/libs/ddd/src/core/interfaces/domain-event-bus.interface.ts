import { IDomainEvent } from '../../core/interfaces';

export interface IDomainEventBus<
  TDomainEvent extends IDomainEvent = IDomainEvent,
> {
  publish<T extends TDomainEvent>(domainEvent: T);

  publishAll(domainEvents: TDomainEvent[]);
}
