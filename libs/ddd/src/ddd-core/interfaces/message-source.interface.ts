import { Subject } from 'rxjs';

import { IDomainEvent } from './../../ddd-events';

export interface IMessageSource<
  DomainEventBase extends IDomainEvent = IDomainEvent,
> {
  bridgeEventsTo<T extends DomainEventBase>(subject: Subject<T>): any;
}
