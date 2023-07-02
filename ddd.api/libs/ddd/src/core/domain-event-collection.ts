import { DomainEvent } from './domain-event';

export class DomainEventCollection {
  private _domainEvents: Array<DomainEvent> = [];

  constructor() {
    this._domainEvents = new Array<DomainEvent>();
  }

  getItems(): DomainEvent[] {
    return this._domainEvents;
  }

  exists(domainEvent: DomainEvent): boolean {
    return this._domainEvents.some(
      (e) => e.domainEventId === domainEvent.domainEventId,
    );
  }

  add(domainEvent: DomainEvent): void {
    if (!domainEvent) return;

    this._domainEvents.push(domainEvent);
  }

  remove(domainEvent: DomainEvent): void {
    if (!domainEvent) return;

    this._domainEvents = this._domainEvents.filter(
      (e) => e.domainEventId === domainEvent.domainEventId,
    );
  }

  clear(): void {
    this._domainEvents = [];
  }

  get count(): number {
    return this._domainEvents.length;
  }
}
