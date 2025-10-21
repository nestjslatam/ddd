import { IDomainEvent } from './domain-event.interface';

/**
 * Represents a domain event bus that is responsible for publishing domain events.
 *
 * @template TDomainEvent The type of domain event.
 */
export interface IDomainEventBus<
  TDomainEvent extends IDomainEvent = IDomainEvent,
> {
  /**
   * Publishes a single domain event.
   *
   * @template T The specific type of domain event to be published.
   * @param domainEvent The domain event to be published.
   */
  publish<T extends TDomainEvent>(domainEvent: T);

  /**
   * Publishes multiple domain events.
   *
   * @param domainEvents The array of domain events to be published.
   */
  publishAll(domainEvents: TDomainEvent[]);
}
