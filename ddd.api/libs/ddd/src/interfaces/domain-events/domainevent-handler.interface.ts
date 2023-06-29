import { DomainEvent } from '../../domaint-event';

export interface IDomainEventHandler<
  TDomainEvent extends DomainEvent = DomainEvent,
> {
  handle(domainEvent: TDomainEvent): Promise<void>;
}
