import { IDomainEvent } from './domain-event.interface';

/**
 * Represents a domain event handler.
 * @template T - The type of domain event.
 */
export interface IDomainEventHandler<T extends IDomainEvent = any> {
  /**
   * Handles the given domain event.
   * @param domainEvent - The domain event to handle.
   * @returns The result of handling the domain event.
   */
  handle(domainEvent: T): any;
}
