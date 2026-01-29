import { AbstractRuleValidator } from '@nestjslatam/ddd-lib';
import { Name } from '../Name';

export class NameLengthValidator extends AbstractRuleValidator<Name> {
  constructor(subject: Name) {
    super(subject);
  }

  public addRules(): void {
    const value = this.subject.getValue();

    if (!value || value.trim().length === 0) {
      this.addBrokenRule('value', 'Name cannot be empty or whitespace only');
    }

    if (value && value.length < 3) {
      this.addBrokenRule('value', 'Name must be at least 3 characters long');
    }

    if (value && value.length > 100) {
      this.addBrokenRule('value', 'Name must not exceed 100 characters');
    }

    if (value && !/^[a-zA-Z0-9\s\-\_]+$/.test(value)) {
      this.addBrokenRule(
        'value',
        'Name can only contain letters, numbers, spaces, hyphens and underscores',
      );
    }
  }
}
