export class DomainException extends Error {
  constructor(message) {
    super(message);
    this.name = 'DomainException';
  }
}
