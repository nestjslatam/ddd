export class DatabaseException extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseException';
  }
}
