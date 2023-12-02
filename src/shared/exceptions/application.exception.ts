export class ApplicationException extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApplicationException';
  }
}
