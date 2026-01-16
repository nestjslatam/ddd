/**
 * Excepción relacionada con eventos de dominio.
 */
export class DomainEventException extends Error {
  constructor(message?: string) {
    super(message || 'Domain event exception');
    this.name = 'DomainEventException';
    Object.setPrototypeOf(this, DomainEventException.prototype);
  }
}
