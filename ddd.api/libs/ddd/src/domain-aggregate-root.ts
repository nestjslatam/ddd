import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEntity } from './domain-entity';
import { DomainEvent, DomainEventCollection } from './domaint-event';

export abstract class DomainAggregateRoot<TProps> extends DomainEntity<TProps> {
  protected abstract businessRules(props: TProps): void;

  private _domainEvents: DomainEventCollection = new DomainEventCollection();

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
    if (!this._domainEvents) new DomainEventCollection();

    this._domainEvents.add(domainEvent);
  }

  removeDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.remove(domainEvent);
  }

  public async publish(eventEmitter: EventEmitter2): Promise<void> {
    await Promise.all(
      this._domainEvents.getItems().map(async (event) => {
        return eventEmitter.emitAsync(event.constructor.name, event);
      }),
    );
    this.clearDomainEvents();
  }
}
