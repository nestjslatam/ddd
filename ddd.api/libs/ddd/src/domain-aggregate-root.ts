/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DomainEntity } from './domain-entity';
import { DomainEventCollection } from './core';
import { IDomainEvent } from './core/interfaces';

export abstract class DomainAggregateRoot<
  TProps,
  TDomainEventBase extends IDomainEvent = IDomainEvent,
> extends DomainEntity<TProps> {
  private _domainEvents: TDomainEventBase[] = [];

  /**
   * Publishes an event. Must be merged with the publisher context in order to work.
   * @param event The event to publish.
   */
  publish<T extends TDomainEventBase = TDomainEventBase>(domainEvent: T) {}

  /**
   * Publishes multiple events. Must be merged with the publisher context in order to work.
   * @param events The events to publish.
   */
  publishAll<T extends TDomainEventBase = TDomainEventBase>(
    domainEvents: T[],
  ) {}

  /**
   * Commits all uncommitted events.
   */
  commit() {
    this.publishAll(this._domainEvents);
    this.clearDomainEvents();
  }

  existsDomainEvent(domainEvent: TDomainEventBase): boolean {
    return this._domainEvents.includes(domainEvent);
  }

  clearDomainEvents(): void {
    this._domainEvents.length = 0;
  }

  get getDomainEvents(): TDomainEventBase[] {
    return this._domainEvents;
  }

  addDomainEvent(domainEvent: TDomainEventBase): void {
    if (!this._domainEvents) new DomainEventCollection();

    this._domainEvents.push(domainEvent);
  }

  removeDomainEvent(domainEvent: TDomainEventBase): void {
    const index = this._domainEvents.indexOf(domainEvent);
    if (index > -1) {
      this._domainEvents.splice(index, 1);
    }
  }
}
