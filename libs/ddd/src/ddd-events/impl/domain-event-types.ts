import { Type } from '@nestjs/common';
import { IDomainEvent, IDomainEventHandler } from '../interfaces';

/**
 * Represents the type of a domain event handler.
 * @template DomainEventBase - The base type of the domain event.
 */
export type DomainEventHandlerType<
  DomainEventBase extends IDomainEvent = IDomainEvent,
> = Type<IDomainEventHandler<DomainEventBase>>;
