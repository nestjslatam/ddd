import { Subject } from 'rxjs';

import { IDomainEvent } from './domain-event.interface';

export interface IMessageSource<
  DomainEventBase extends IDomainEvent = IDomainEvent,
> {
  bridgeEventsTo<T extends DomainEventBase>(subject: Subject<T>): any;
}
