/* eslint-disable @typescript-eslint/no-unused-vars */
import { ITrackingProps } from './ddd-core';
import { DomainEntity } from './ddd-core/ddd-base-classes';
import { IDomainEvent, ISerializableEvent } from './ddd-events';
import { DomainObjectHelper } from './ddd-helpers';
import { DomainUid } from './ddd-valueobjects';

const VERSION = Symbol('version');
const IS_AUTOCOMMIT_ENABLED = Symbol();

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
  /**
   * The list of domain events.
   */
  protected _domainEvents: TDomainEventBase[] = [];

  /**
   * The auto commit value.
   */
  protected [IS_AUTOCOMMIT_ENABLED] = false;

  /**
   * The version of the aggregate root.
   */
  protected [VERSION] = 0;

  /**
   * Creates an instance of domain aggregate root.
   *
   * @param id - The identifier of the aggregate root.
   * @param props - The properties of the aggregate root.
   * @param trackingProps - The tracking properties of the aggregate root.
   */
  constructor(id: DomainUid, props: TProps, trackingProps: ITrackingProps) {
    super({ id, props, trackingProps });

    this.setVersion(0);
  }

  /**
   * Gets the version of the aggregate root.
   */
  public get version(): number {
    return this[VERSION];
  }

  /**
   * Sets the auto commit value.
   * @param value The value to set.
   */
  set autoCommit(value: boolean) {
    this[IS_AUTOCOMMIT_ENABLED] = value;
  }

  /**
   * Gets the auto commit value.
   */
  get autoCommit(): boolean {
    return this[IS_AUTOCOMMIT_ENABLED];
  }

  /**
   * Sets the version of the aggregate root.
   *
   * @param version The version to set.
   */
  protected setVersion(version: number): void {
    this[VERSION] = version;
  }

  /**
   * Loads the domain events from the history.
   *
   * @param history The history of domain events.
   */
  public loadFromHistory(history: ISerializableEvent[]): void {
    const domainEvents = history.map((event) => event.data);
    domainEvents.forEach((event) =>
      this.applyEventFromHistory(event, { skipHandler: false }),
    );

    const lastEvent = history[history.length - 1];
    this.setVersion(lastEvent.position);
  }

  private applyEvent<T extends TDomainEventBase = TDomainEventBase>(
    event: T,
    skipHandler?: boolean,
  ): void {
    if (!skipHandler) {
      const handler = DomainObjectHelper.getEventHandler(event);
      handler && handler.call(this, event);
    }
  }

  apply<T extends TDomainEventBase = TDomainEventBase>(
    event: T,
    options?: { skipHandler?: boolean },
  ): void {
    this.applyNewEvent(event, options);
  }

  protected applyNewEvent<T extends TDomainEventBase = TDomainEventBase>(
    event: T,
    options?: { skipHandler?: boolean },
  ): void {
    if (!this.autoCommit) {
      this.addDomainEvent(event);
    }
    this.applyEvent(event, options?.skipHandler);
  }

  protected applyEventFromHistory<
    T extends TDomainEventBase = TDomainEventBase,
  >(event: T, options?: { skipHandler?: boolean }): void {
    this.applyEvent(event, options?.skipHandler);
  }

  /**
   * Commits the domain events by publishing them and clearing the list.
   */
  commit(): TDomainEventBase[] {
    const events = [...this._domainEvents];
    this.clearDomainEvents();
    return events;
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
    if (this.existsDomainEvent(domainEvent)) {
      return;
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
  get DomainEvents(): TDomainEventBase[] {
    return this._domainEvents;
  }
}
