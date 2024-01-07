/* eslint-disable @typescript-eslint/no-unused-vars */
import { DomainEntity } from './ddd-entity';
import { IDomainEvent } from './ddd-events';

/**
 * Abstract class representing a domain aggregate root.
 * An aggregate root is a domain object that serves as a root entity for a group of related entities.
 * It provides methods for managing domain events and publishing them.
 *
 * @template TProps - The type of properties for the aggregate root.
 * @template TDomainEventBase - The base type for domain events.
 */
export abstract class DomainAggregateRoot<
  TProps,
  TDomainEventBase extends IDomainEvent = IDomainEvent,
> extends DomainEntity<TProps> {
  protected _domainEvents: TDomainEventBase[] = [];

  /**
   * Publishes a domain event.
   *
   * @template T - The type of domain event to publish.
   * @param domainEvent - The domain event to publish.
   */
  publish<T extends TDomainEventBase = TDomainEventBase>(domainEvent: T) {}

  /**
   * Publishes multiple domain events.
   *
   * @template T - The type of domain events to publish.
   * @param domainEvents - The domain events to publish.
   */
  publishAll<T extends TDomainEventBase = TDomainEventBase>(
    domainEvents: T[],
  ) {}

  /**
   * Commits the domain events by publishing them and clearing the list.
   */
  commit() {
    this.publishAll(this._domainEvents);
    this.clearDomainEvents();
  }

  /**
   * Clears the list of domain events.
   */
  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /**
   * Adds a domain event to the list.
   *
   * @param domainEvent - The domain event to add.
   */
  addDomainEvent(domainEvent: TDomainEventBase): void {
    if (!this.existsDomainEvent(domainEvent)) {
      this._domainEvents = [];
    }

    this._domainEvents.push(domainEvent);
  }

  /**
   * Removes a domain event from the list.
   *
   * @param domainEvent - The domain event to remove.
   */
  removeDomainEvent(domainEvent: TDomainEventBase): void {
    if (!this.existsDomainEvent(domainEvent)) {
      return;
    }

    const index = this._domainEvents.indexOf(domainEvent);

    if (index > -1) {
      this._domainEvents.splice(index, 1);
    }
  }

  /**
   * Checks if a domain event exists in the list.
   *
   * @param domainEvent - The domain event to check.
   * @returns True if the domain event exists, false otherwise.
   */
  existsDomainEvent(domainEvent: TDomainEventBase): boolean {
    return this._domainEvents.includes(domainEvent);
  }

  /**
   * Retrieves the list of domain events.
   *
   * @returns The list of domain events.
   */
  getDomainEvents(): TDomainEventBase[] {
    return this._domainEvents;
  }

  /**
   * Uncommits the domain events by clearing the list.
   */
  uncommit() {
    this._domainEvents.length = 0;
  }
}
