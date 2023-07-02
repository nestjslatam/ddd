import { v4 } from 'uuid';

export abstract class DomainEvent {
  readonly id: string;
  readonly eventType: 'DOMAIN_EVENT';
  readonly eventName: string;
  readonly version: number;
  readonly aggregateId: string;
  readonly occurredOn: string;
  readonly eventData?: string;

  constructor(params: { aggregateId: string; eventName: string }) {
    const { aggregateId, eventName } = params;

    try {
      this.id = v4().toString();
    } catch (error) {
      throw new Error(`Error generating DomainEvent Id: ${error}`);
    }

    this.aggregateId = aggregateId;
    this.occurredOn = new Date().toUTCString();
    this.eventName = eventName;
  }
}

export class DomainEventCollection {
  private _domainEvents: Array<DomainEvent> = [];

  constructor() {
    this._domainEvents = new Array<DomainEvent>();
  }

  getItems(): DomainEvent[] {
    return this._domainEvents;
  }

  exists(domainEvent: DomainEvent): boolean {
    return this._domainEvents.some((e) => e.id === domainEvent.id);
  }

  add(domainEvent: DomainEvent): void {
    if (!domainEvent) return;

    this._domainEvents.push(domainEvent);
  }

  remove(domainEvent: DomainEvent): void {
    if (!domainEvent) return;

    this._domainEvents = this._domainEvents.filter(
      (e) => e.id === domainEvent.id,
    );
  }

  clear(): void {
    this._domainEvents = [];
  }

  get count(): number {
    return this._domainEvents.length;
  }
}
