import { DddValueObject } from '../valueobject';
import { StringNotNullOrEmptyValidator } from './string-notnullorempty.validator';

export class StringValueObject extends DddValueObject<string> {
  protected constructor(value: string) {
    super(value);
  }

  override addValidators(): void {
    super.addValidators();

    this.validatorRules.add(new StringNotNullOrEmptyValidator(this));
  }

  protected getEqualityComponents(): Iterable<any> {
    if (this.getValue() === null || this.getValue() === undefined) {
      return [];
    }
    return [this.getValue()];
  }

  public static create(value: string): StringValueObject {
    return new StringValueObject(value);
  }

  public static load(value: string): StringValueObject {
    return new StringValueObject(value);
  }
}
