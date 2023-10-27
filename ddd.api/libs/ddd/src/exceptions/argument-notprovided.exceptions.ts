export class ArgumentNotProvidedException extends Error {
  constructor(message) {
    super(message);
    this.name = 'ArgumentNotProvidedException';
  }
}
