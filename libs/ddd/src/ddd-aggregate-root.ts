/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DomainEntity } from './ddd-entity';

import { IDomainEvent } from './ddd-events';

export abstract class DomainAggregateRoot<
  TProps,
  TDomainEventBase extends IDomainEvent = IDomainEvent,
> extends DomainEntity<TProps> {
  // #region Properties -----------------------------------------------------------
  protected _domainEvents: TDomainEventBase[] = [];
  // #endregion --------------------------------------------------------------------

  // #region Behavior ------------------------------------------------------------
  publish<T extends TDomainEventBase = TDomainEventBase>(domainEvent: T) {}

  publishAll<T extends TDomainEventBase = TDomainEventBase>(
    domainEvents: T[],
  ) {}

  // #endregion -----------------------------------------------------------------

  // #region Public Methods ------------------------------------------------------
  commit() {
    this.publishAll(this._domainEvents);
    this.clearDomainEvents();
  }

  uncommit() {
    this._domainEvents.length = 0;
  }

  getDomainEvents(): TDomainEventBase[] {
    return this._domainEvents;
  }

  existsDomainEvent(domainEvent: TDomainEventBase): boolean {
    return this._domainEvents.includes(domainEvent);
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  addDomainEvent(domainEvent: TDomainEventBase): void {
    if (!this._domainEvents) {
      this._domainEvents = [];
    }

    this._domainEvents.push(domainEvent);
  }

  removeDomainEvent(domainEvent: TDomainEventBase): void {
    const index = this._domainEvents.indexOf(domainEvent);
    if (index > -1) {
      this._domainEvents.splice(index, 1);
    }
  }

  // #endregion -----------------------------------------------------------------
}
