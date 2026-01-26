import { AbstractRuleValidator } from '../core';
import { DddValueObject } from '../valueobject';

export class NumberNotNullValidator extends AbstractRuleValidator<
  DddValueObject<number>
> {
  constructor(subject: DddValueObject<number>) {
    super(subject);
  }

  public addRules(): void {
    if (
      this.subject.getValue() === null ||
      this.subject.getValue() === undefined
    ) {
      this.addBrokenRule('Value', 'Value cannot be null or undefined');
    }
  }
}
