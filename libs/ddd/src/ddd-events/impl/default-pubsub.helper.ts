import { Subject } from 'rxjs';

import { IMessageSource } from './../../ddd-core';
import { IDomainEvent, IDomainEventPublisher } from '../interfaces';

export class DefaultPubSubHelper<DomainEventBase extends IDomainEvent>
  implements
    IDomainEventPublisher<DomainEventBase>,
    IMessageSource<DomainEventBase>
{
  constructor(private subject$: Subject<DomainEventBase>) {}

  publish<T extends DomainEventBase>(event: T) {
    this.subject$.next(event);
  }

  bridgeEventsTo<T extends DomainEventBase>(subject: Subject<T>) {
    this.subject$ = subject;
  }
}
