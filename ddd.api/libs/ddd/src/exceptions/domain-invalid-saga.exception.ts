export class DomainInvalidSagaException extends Error {
  constructor() {
    super(
      `Invalid domain saga exception. Each saga should return an Observable object`,
    );
  }
}
