import { Subject } from 'rxjs';

import { DomainEvent } from '../domaint-event';
import {
  IDomainEventMessageSource,
  IDomainEventPublisher,
} from '../interfaces';

export class DomainDefaultEventPublisher<TDomainEvent extends DomainEvent>
  implements
    IDomainEventPublisher<TDomainEvent>,
    IDomainEventMessageSource<TDomainEvent>
{
  constructor(private subject$: Subject<TDomainEvent>) {}

  publish(domainEvent: TDomainEvent) {
    if (!domainEvent) throw new Error('DomainEvent is required');

    this.subject$.next(domainEvent);
  }

  bridgeEventsTo(subject: Subject<TDomainEvent>) {
    if (!subject) throw new Error('Subject is required');

    this.subject$ = subject;
  }
}
