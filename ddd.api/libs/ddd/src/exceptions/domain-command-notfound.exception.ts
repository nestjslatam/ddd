export class DomainCommandHandlerNotFoundException extends Error {
  constructor(name: string) {
    super(
      `The domain command handler for the "${name}" command was not found!`,
    );
  }
}
