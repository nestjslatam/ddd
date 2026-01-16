import { Subject } from 'rxjs';

import { IDomainEvent } from '../../ddd-events';

/**
 * Represents a message source that can bridge domain events to a subject.
 *
 * @template DomainEventBase The base type for domain events.
 */
export interface IMessageSource<
  DomainEventBase extends IDomainEvent = IDomainEvent,
> {
  /**
   * Bridges domain events to the specified subject.
   *
   * @template T The type of domain event to bridge.
   * @param subject The subject to bridge the domain events to.
   * @returns An object representing the bridge between the message source and the subject.
   */
  bridgeEventsTo<T extends DomainEventBase>(subject: Subject<T>): any;
}
