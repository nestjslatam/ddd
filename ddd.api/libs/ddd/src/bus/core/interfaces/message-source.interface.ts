import { IDomainEvent } from '@nestjslatam/ddd';
import { Subject } from 'rxjs';

export interface IMessageSource<
  DomainEventBase extends IDomainEvent = IDomainEvent,
> {
  bridgeEventsTo<T extends DomainEventBase>(subject: Subject<T>): any;
}
