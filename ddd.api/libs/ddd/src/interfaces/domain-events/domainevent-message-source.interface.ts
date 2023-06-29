import { Subject } from 'rxjs';
import { DomainEvent } from '../../domaint-event';

export interface IDomainEventMessageSource<
  TDomainEvent extends DomainEvent = DomainEvent,
> {
  bridgeEventsTo(subject$: Subject<TDomainEvent>): any;
}
