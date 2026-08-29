import {
  NumberNotNullValidator,
  NumberPositiveValidator,
  NumberValueObject,
} from '@nestjslatam/ddd-lib';
import { PriceRangeValidator } from './validators';
import { BrokenRulesException } from '../exceptions/broken-rules.exception';

export class Price extends NumberValueObject {
  constructor(value: number) {
    super(value);
  }

  static create(value: number): Price {
    const price = new Price(value);
    if (!price.isValid) {
      const errors = price.brokenRules.getBrokenRules();
      throw new BrokenRulesException('Price', errors);
    }
    return price;
  }

  static load(value: number): Price {
    return new Price(value);
  }

  override addValidators(): void {
    super.addValidators();
    this.validatorRules.add(new NumberNotNullValidator(this));
    this.validatorRules.add(new NumberPositiveValidator(this));
    this.validatorRules.add(new PriceRangeValidator(this));
  }
}
