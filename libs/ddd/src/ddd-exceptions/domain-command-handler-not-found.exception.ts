/**
 * Excepción que se lanza cuando no se encuentra un manejador de comandos.
 */
export class DomainCommandHandlerNotFoundException extends Error {
  constructor(message?: string) {
    super(message || 'Domain command handler not found');
    this.name = 'DomainCommandHandlerNotFoundException';
    Object.setPrototypeOf(
      this,
      DomainCommandHandlerNotFoundException.prototype,
    );
  }
}
