import { IDomainEvent } from './domain-event.interface';

/**
 * Represents a domain event publisher that is responsible for publishing domain events.
 * @template DomainEventBase The base type for domain events.
 */
export interface IDomainEventPublisher<
  DomainEventBase extends IDomainEvent = IDomainEvent,
> {
  /**
   * Publishes a single domain event.
   * @template T The specific type of the domain event.
   * @param domainEvent The domain event to be published.
   * @param context Optional context information.
   * @returns The result of the publish operation.
   */
  publish<T extends DomainEventBase = DomainEventBase>(
    domainEvent: T,
    context?: unknown,
  ): any;

  /**
   * Publishes multiple domain events.
   * @template T The specific type of the domain events.
   * @param domainEvents The array of domain events to be published.
   * @param context Optional context information.
   * @returns The result of the publish operation.
   */
  publishAll?<T extends DomainEventBase = DomainEventBase>(
    domainEvents: T[],
    context?: unknown,
  ): any;
}
