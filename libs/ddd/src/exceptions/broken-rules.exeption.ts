export class BrokenRulesException extends Error {
  constructor(public message: string) {
    super(message);

    code: 'ERR_BROKEN_RULES';
  }
}
