import { AbstractRuleValidator } from '../core';
import { DddValueObject } from '../valueobject';

export class StringNotNullOrEmptyValidator extends AbstractRuleValidator<
  DddValueObject<string>
> {
  constructor(subject: DddValueObject<string>) {
    super(subject);
  }

  public addRules(): void {
    if (
      this.subject.getValue() === null ||
      this.subject.getValue() === undefined
    ) {
      this.addBrokenRule('Value', 'Value cannot be null or undefined');
    }
    if (this.subject.getValue() === '') {
      this.addBrokenRule('Value', 'Value cannot be empty');
    }
  }
}
