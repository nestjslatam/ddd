import { StringValueObject } from '@nestjslatam/ddd-lib';
import { DescriptionLengthValidator } from './validators';

export class Description extends StringValueObject {
  constructor(value: string) {
    super(value);
  }

  static create(value: string): Description {
    const description = new Description(value);
    if (!description.isValid) {
      const errors = description.brokenRules.getBrokenRules();
      throw new Error(
        `Invalid description: ${errors.map((e) => e.message).join(', ')}`,
      );
    }
    return description;
  }

  static load(value: string): Description {
    return new Description(value);
  }

  override addValidators(): void {
    super.addValidators();
    this.validatorRules.add(new DescriptionLengthValidator(this));
  }
}
