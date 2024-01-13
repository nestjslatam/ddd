import {
  AbstractDomainString,
  BrokenRule,
  IDomainPrimitive,
} from '@nestjslatam/ddd-lib';

export class PicturePath extends AbstractDomainString {
  protected businessRules(props: IDomainPrimitive<string>): void {
    const { value } = props;

    if (value.length < 3) {
      this.addBrokenRule(
        new BrokenRule('value', 'Value must be greater than 3 characters'),
      );
    }

    if (value.length > 2800) {
      this.addBrokenRule(
        new BrokenRule('value', 'Value must be less than 2800 characters'),
      );
    }
  }

  static create(value: string): PicturePath {
    return new PicturePath(value);
  }
}
