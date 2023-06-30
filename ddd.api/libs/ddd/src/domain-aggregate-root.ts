/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DomainEvent, DomainEventCollection } from './domaint-event';

export class DomainAggregateRoot {
  private _domainEvents: DomainEventCollection;

  protected businessRules(): void {}

  publish(domainEvent: DomainEvent) {}

  publishAll(domainEvents: DomainEvent[]) {}

  constructor() {
    this._domainEvents = new DomainEventCollection();
  }

  existsDomainEvent(domainEvent: DomainEvent): boolean {
    return this._domainEvents.exists(domainEvent);
  }

  clearDomainEvents(): void {
    this._domainEvents.clear();
  }

  get getDomainEvents(): DomainEvent[] {
    return this._domainEvents.getItems();
  }

  addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.add(domainEvent);
  }

  removeDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.remove(domainEvent);
  }

  commit(): void {
    if (!this._domainEvents) return;

    this.publishAll(this._domainEvents.getItems());
    this._domainEvents.clear();
  }
}
