import {
  NumberNotNullValidator,
  NumberPositiveValidator,
  NumberValueObject,
} from '@nestjslatam/ddd-lib';

export class Price extends NumberValueObject {
  constructor(value: number) {
    super(value);
  }

  static create(value: number): Price {
    return new Price(value);
  }

  static load(value: number): Price {
    return new Price(value);
  }

  override addValidators(): void {
    super.addValidators();
    this.validatorRules.add(new NumberNotNullValidator(this));
    this.validatorRules.add(new NumberPositiveValidator(this));
  }
}
