/* eslint-disable @typescript-eslint/no-unused-vars */
import { DomainEntity } from './ddd-entity';
import { DomainEventsManager } from './ddd-managers/domainevents.manager';

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
  TAggregateRoot,
  TProps,
> extends DomainEntity<TAggregateRoot, TProps> {
  private readonly _domainEvents: DomainEventsManager;

  constructor(props: TProps) {
    super(props);

    this._domainEvents = new DomainEventsManager(this);

    this.setVersion(0);
  }

  /**
   * Gets the version of the aggregate root.
   */
  public get version(): number {
    return this[VERSION];
  }

  /**
   * Sets the version of the aggregate root.
   *
   * @param version The version to set.
   */
  protected setVersion(version: number): void {
    this[VERSION] = version;
  }

  DomainEvents(): DomainEventsManager {
    return this._domainEvents;
  }
}
