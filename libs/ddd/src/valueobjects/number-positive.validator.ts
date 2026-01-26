import { AbstractRuleValidator } from '../core';
import { DddValueObject } from '../valueobject';

export class NumberPositiveValidator extends AbstractRuleValidator<
  DddValueObject<number>
> {
  constructor(subject: DddValueObject<number>) {
    super(subject);
  }

  public addRules(): void {
    if (this.subject.getValue() <= 0) {
      this.addBrokenRule('Value', 'Value must be a positive number');
    }
  }
}
