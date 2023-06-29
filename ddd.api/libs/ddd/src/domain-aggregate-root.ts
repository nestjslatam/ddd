import { DomainEntity } from './domain-entity';
import { DomainEvent } from './domaint-event';
import { DomainException } from './exceptions';
import { DomainGuard, getDomainEventHandler } from './helpers';

export abstract class DomainAggregateRoot<
  TAggregateProps,
  TDomainEvent extends DomainEvent = DomainEvent,
> extends DomainEntity<TAggregateProps> {
  private _domainEvents: Array<TDomainEvent> = [];
  private _version = -1;

  public setVersion(value: number): void {
    if (DomainGuard.isEmpty(value) || !DomainGuard.isNumber(value))
      throw new DomainException('The version number must be a number');

    this._version = value;
  }

  public getVersion(): number {
    return this._version;
  }

  publish(domainEvent: TDomainEvent) {}

  publishAll(domainEvents: TDomainEvent[]) {}

  protected existsEvent(domainEvent: TDomainEvent): boolean {
    return this._domainEvents.includes(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  get getDomainEvents(): TDomainEvent[] {
    return this._domainEvents;
  }

  addEvent(domainEvent: TDomainEvent): void {
    if (!this.existsEvent(domainEvent)) this._domainEvents.push(domainEvent);
  }

  removeEvent(domainEvent: TDomainEvent): void {
    if (!domainEvent) return;

    this._domainEvents = this._domainEvents.filter(
      (e) => e.id === domainEvent.id,
    );
  }

  commit(): void {
    if (!this._domainEvents) return;

    this.publishAll(this._domainEvents);
    this._domainEvents.length = 0;
  }

  protected loadFromHistory(history: TDomainEvent[]): void {
    if (!history) return;

    history.forEach((event) => this.apply(event, true));
  }

  apply<T extends TDomainEvent = TDomainEvent>(
    event: T,
    isFromHistory = false,
  ): void {
    if (!event) return;

    if (!isFromHistory) this._domainEvents.push(event);

    this.publish(event);

    const handler = getDomainEventHandler(event);

    handler && handler.call(this, event);
  }

  replayEvents(events: TDomainEvent[]): void {
    if (events) {
      events.forEach((e) => this.apply(e, true));
    }
  }
}
