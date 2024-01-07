import { DomainEvent } from './domain-event';

/**
 * Represents a collection of domain events.
 */
export class DomainEventCollection {
  private _domainEvents: Array<DomainEvent> = [];

  /**
   * Creates a new instance of DomainEventCollection.
   */
  constructor() {
    this._domainEvents = new Array<DomainEvent>();
  }

  /**
   * Gets the items in the domain event collection.
   * @returns An array of DomainEvent objects.
   */
  getItems(): DomainEvent[] {
    return this._domainEvents;
  }

  /**
   * Checks if a domain event exists in the collection.
   * @param domainEvent - The domain event to check.
   * @returns True if the domain event exists, false otherwise.
   */
  exists(domainEvent: DomainEvent): boolean {
    return this._domainEvents.some(
      (e) => e.domainEventId === domainEvent.domainEventId,
    );
  }

  /**
   * Adds a domain event to the collection.
   * @param domainEvent - The domain event to add.
   */
  add(domainEvent: DomainEvent): void {
    if (!domainEvent) return;

    this._domainEvents.push(domainEvent);
  }

  /**
   * Removes a domain event from the collection.
   * @param domainEvent - The domain event to remove.
   */
  remove(domainEvent: DomainEvent): void {
    if (!domainEvent) return;

    this._domainEvents = this._domainEvents.filter(
      (e) => e.domainEventId === domainEvent.domainEventId,
    );
  }

  /**
   * Clears all domain events from the collection.
   */
  clear(): void {
    this._domainEvents = [];
  }

  /**
   * Gets the number of domain events in the collection.
   */
  get count(): number {
    return this._domainEvents.length;
  }
}
