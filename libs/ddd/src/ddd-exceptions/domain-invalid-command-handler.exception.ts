/**
 * Excepción que se lanza cuando un manejador de comandos es inválido.
 */
export class DomainInvalidCommandHandlerException extends Error {
  constructor(message?: string) {
    super(message || 'Invalid domain command handler');
    this.name = 'DomainInvalidCommandHandlerException';
    Object.setPrototypeOf(this, DomainInvalidCommandHandlerException.prototype);
  }
}
