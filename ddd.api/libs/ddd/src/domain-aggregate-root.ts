/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DomainEntity } from './domain-entity';
import { DomainEventCollection } from './core';
import { IDomainEvent, IDomainEventHandler } from './core/interfaces';
import { Type } from './core/interfaces/type.interface';

export abstract class DomainAggregateRoot<
  TProps,
  TDomainEventBase extends IDomainEvent = IDomainEvent,
> extends DomainEntity<TProps> {
  protected abstract businessRules(props: TProps): void;

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

  /**
   * Loads events from history.
   * @param history The history to load.
   */
  loadFromHistory(history: TDomainEventBase[]) {
    history.forEach((event) => this.apply(event, true));
  }

  /**
   * Applies an event.
   * If auto commit is enabled, the event will be published immediately (note: must be merged with the publisher context in order to work).
   * Otherwise, the event will be stored in the internal events array, and will be published when the commit method is called.
   * Also, the corresponding event handler will be called (if exists).
   * For example, if the event is called UserCreatedEvent, the "onUserCreatedEvent" method will be called.
   *
   * @param event The event to apply.
   * @param isFromHistory Whether the event is from history.
   */
  apply(domainEvent: TDomainEventBase, isFromHistory = false) {
    if (!isFromHistory) {
      this._domainEvents.push(domainEvent);
    }
    this.publish(domainEvent);

    const handler = this.getDomainEventHandler(domainEvent);
    handler && handler.call(this, domainEvent);
  }

  protected getDomainEventHandler(
    domainEvent: TDomainEventBase,
  ): Type<IDomainEventHandler> | undefined {
    const handler = `on${this.getDomainEventName(domainEvent)}`;
    return this[handler];
  }

  protected getDomainEventName(domainEvent: any): string {
    const { constructor } = Object.getPrototypeOf(domainEvent);
    return constructor.name as string;
  }
}
