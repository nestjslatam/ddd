/**
 * Excepción relacionada con el bus de eventos de dominio.
 */
export class DomainEventBusException extends Error {
  constructor(message?: string) {
    super(message || 'Domain event bus exception');
    this.name = 'DomainEventBusException';
    Object.setPrototypeOf(this, DomainEventBusException.prototype);
  }
}
