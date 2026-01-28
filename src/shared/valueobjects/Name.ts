import { StringValueObject } from '@nestjslatam/ddd-lib';
import { NameLengthValidator } from './validators';

export class Name extends StringValueObject {
  constructor(value: string) {
    super(value);
  }

  static create(value: string): Name {
    const name = new Name(value);
    if (!name.isValid) {
      const errors = name.brokenRules.getBrokenRules();
      throw new Error(
        `Invalid name: ${errors.map((e) => e.message).join(', ')}`,
      );
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
