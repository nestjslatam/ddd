export class DomainInvalidCommandHandlerException extends Error {
  constructor() {
    super(
      `Invalid command handler exception (missing @DomainCommandHandler() decorator?)`,
    );
  }
}
