import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Description } from '../description';

export class DescriptionLengthValidator extends AbstractRuleValidator<Description> {
  constructor(subject: Description) {
    super(subject);
  }

  public addRules(): void {
    const value = this.subject.getValue();

    if (!value || value.trim().length === 0) {
      this.addBrokenRule(
        'value',
        'Description cannot be empty or whitespace only',
      );
    }

    if (value && value.length < 10) {
      this.addBrokenRule(
        'value',
        'Description must be at least 10 characters long',
      );
    }

    if (value && value.length > 500) {
      this.addBrokenRule('value', 'Description must not exceed 500 characters');
    }
  }
}
