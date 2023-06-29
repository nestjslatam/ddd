import { DomainEvent } from '../../domaint-event';

export interface IDomainEventPublisher<
  TDomainEvent extends DomainEvent = DomainEvent,
> {
  publish(domainEvent: TDomainEvent): any;
  publishAll?(domainEvents: TDomainEvent[]): any;
}
