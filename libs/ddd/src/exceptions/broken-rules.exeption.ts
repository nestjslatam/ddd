export class BrokenRulesException extends Error {
  constructor(public message: string) {
    super(message);
  }
}
