import { DomainEvent } from '../../domaint-event';

export interface IDomainEventBus<
  TDomainEvent extends DomainEvent = DomainEvent,
> {
  publish(domainEvent: TDomainEvent);
  publishAll(domainEvents: TDomainEvent[]);
}
