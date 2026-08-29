import { StringValueObject } from '@nestjslatam/ddd-lib';
import { NameLengthValidator } from './validators';
import { BrokenRulesException } from '../exceptions/broken-rules.exception';

export class Name extends StringValueObject {
  constructor(value: string) {
    super(value);
  }

  static create(value: string): Name {
    const name = new Name(value);
    if (!name.isValid) {
      const errors = name.brokenRules.getBrokenRules();
      throw new BrokenRulesException('Name', errors);
    }
    return name;
  }

  static load(value: string): Name {
    return new Name(value);
  }

  override addValidators(): void {
    super.addValidators();
    this.validatorRules.add(new NameLengthValidator(this));
  }
}
