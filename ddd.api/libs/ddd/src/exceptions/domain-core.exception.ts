import { BrokenRuleCollection } from '../models';

export class DomainException extends Error {
  constructor(brokenRules: BrokenRuleCollection) {
    super();
    const className: string = (<unknown>this.constructor.name) as string;
    // TODO: Refactor this to use a better message
    this.message = `Broken Rules Exception in ${className}: `;
    this.message += brokenRules
      .getItems()
      .map((br) => `${br.code} + '- ' + ${br.description}\n`)
      .join(', ');
  }
}
