import { v4 as uuidv4 } from 'uuid';
import { DomainAggregateRoot } from '../ddd-aggregate-root';
import { IDomainEvent } from '../ddd-events';
import { IMetadata } from '../ddd-core';

/**
 * Gestiona los eventos de dominio, el seguimiento de cambios no confirmados y la aplicación de eventos.
 * Traducido de DomainEventsManager.cs
 */
export class DomainEventsManager {
  private readonly _domainEvents: IDomainEvent[] = [];
  public version: number;

  constructor(public readonly aggregateRoot: DomainAggregateRoot<any, any>) {
    if (!aggregateRoot) {
      throw new Error('ArgumentNullException: aggregateRoot cannot be null');
    }
    this.version = -1;
  }

  /**
   * Obtiene los cambios no confirmados (uncommitted).
   */
  public getUncommittedChanges(): ReadonlyArray<IDomainEvent> {
    return Object.freeze([...this._domainEvents]);
  }

  /**
   * Marca todos los cambios como confirmados (limpia la lista local).
   */
  public markChangesAsCommitted(): void {
    this._domainEvents.length = 0;
  }

  /**
   * Carga el estado de la entidad a partir del historial de eventos.
   */
  public loadFromHistory(history: ReadonlyArray<IDomainEvent>): void {
    if (!history) {
      throw new Error('ArgumentNullException: history cannot be null');
    }

    for (const event of history) {
      this.applyChange(event, false);
    }
  }

  /**
   * Aplica un evento de dominio.
   * En TS, emulamos la reflexión buscando un método "apply[EventName]" en el AggregateRoot.
   */
  public applyChange(domainEvent: IDomainEvent, isNew: boolean = true): void {
    if (!domainEvent) {
      throw new Error('ArgumentNullException: domainEvent cannot be null');
    }

    // Buscamos el método de aplicación en el Aggregate Root.
    // Convención: Si el evento es 'VideoPublishedEvent', el método debe ser 'applyVideoPublishedEvent'
    const eventName = domainEvent.constructor.name;
    const methodName = `apply${eventName}`;

    const target = this.aggregateRoot as any;

    if (typeof target[methodName] !== 'function') {
      throw new Error(
        `InvalidOperationException: Missing ${methodName} method on ${target.constructor.name}`,
      );
    }

    // Invocamos el método de aplicación
    target[methodName](domainEvent);

    if (isNew) {
      this._domainEvents.push(domainEvent);
    }
  }

  /**
   * Lanza un evento de dominio, asignando metadatos si es necesario.
   */
  public raiseEvent(domainEvent: IDomainEvent): void {
    if (!domainEvent) {
      throw new Error('ArgumentNullException: domainEvent cannot be null');
    }

    // Verificamos si el evento soporta metadatos (Duck Typing)
    if ('setMetadata' in domainEvent) {
      (domainEvent as unknown as IMetadata).setMetadata(
        uuidv4(),
        domainEvent.constructor.name,
        this.aggregateRoot.Id.getValue(),
        this.aggregateRoot.constructor.name,
      );
    }

    this.applyChange(domainEvent, true);
  }

  /**
   * Vuelve a ejecutar una colección de eventos.
   */
  public replayEvents(domainEvents: Iterable<IDomainEvent>): void {
    if (!domainEvents) {
      throw new Error('ArgumentNullException: domainEvents cannot be null');
    }

    for (const event of domainEvents) {
      this.applyChange(event, false);
    }
  }
}
