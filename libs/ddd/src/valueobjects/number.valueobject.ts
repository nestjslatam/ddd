
import { DddValueObject } from '../valueobject';
import { NumberNotNullValidator } from './number-notnull.validator';
import { NumberPositiveValidator } from './number-positive.validator';

export class NumberValueObject extends DddValueObject<number> {
  constructor(value: number) {
    super(value);
  }

  static create(value: number): NumberValueObject {
    return new NumberValueObject(value);
  }

  static load(value: number): NumberValueObject {
    return new NumberValueObject(value);
  }

  protected getEqualityComponents(): Iterable<any> {
    if (this.getValue() === null || this.getValue() === undefined) {
      return [];
    }
    return [this.getValue()];
  }

  override addValidators(): void {
    super.addValidators();
    this.validatorRules.add(new NumberNotNullValidator(this));
    this.validatorRules.add(new NumberPositiveValidator(this));
  }
}
