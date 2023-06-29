export class DomainInvalidEventHandlerException extends Error {
  constructor() {
    super(
      `Invalid event handler exception (missing @DomainEventHandler() decorator?)`,
    );
  }
}
