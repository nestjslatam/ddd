/**
 * Excepción que se lanza cuando una saga es inválida.
 */
export class DomainInvalidSagaException extends Error {
  constructor(message?: string) {
    super(message || 'Invalid domain saga');
    this.name = 'DomainInvalidSagaException';
    Object.setPrototypeOf(this, DomainInvalidSagaException.prototype);
  }
}
