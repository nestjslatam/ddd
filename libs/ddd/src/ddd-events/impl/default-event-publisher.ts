import { Subject } from 'rxjs';

import { IMessageSource } from '../../ddd-core';
import { IDomainEvent, IDomainEventPublisher } from '../interfaces';

/**
 * Default implementation of the domain event publisher.
 * This class is responsible for publishing domain events to subscribers.
 *
 * @template TDomainEventBase - The base type for domain events.
 */
export class DefaultDomainEventPublisher<TDomainEventBase extends IDomainEvent>
  implements
    IDomainEventPublisher<TDomainEventBase>,
    IMessageSource<TDomainEventBase>
{
  /**
   * Creates an instance of DefaultDomainEventPublisher.
   *
   * @param subject$ - The subject to which domain events will be published.
   */
  constructor(private subject$: Subject<TDomainEventBase>) {}

  /**
   * Publishes a domain event to the subject.
   *
   * @template T - The type of the domain event.
   * @param event - The domain event to be published.
   */
  publish<T extends TDomainEventBase>(event: T) {
    this.subject$.next(event);
  }

  /**
   * Bridges the events from the current subject to another subject.
   *
   * @template T - The type of the domain event.
   * @param subject - The subject to bridge the events to.
   */
  bridgeEventsTo<T extends TDomainEventBase>(subject: Subject<T>) {
    this.subject$ = subject;
  }
}
