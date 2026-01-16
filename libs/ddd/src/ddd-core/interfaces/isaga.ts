import { Observable } from 'rxjs';
import { IDomainEvent } from '../../ddd-events';
import { IDomainCommand } from '../../ddd-commands';

/**
 * Represents a Saga in the Domain-Driven Design (DDD) architecture.
 * A Saga is responsible for coordinating and orchestrating the execution of domain commands based on domain events.
 *
 * @template EventBase The base type for domain events.
 * @template DomainCommandBase The base type for domain commands.
 */
export type ISaga<
  EventBase extends IDomainEvent = IDomainEvent,
  DomainCommandBase extends IDomainCommand = IDomainCommand,
> = (events$: Observable<EventBase>) => Observable<DomainCommandBase>;
