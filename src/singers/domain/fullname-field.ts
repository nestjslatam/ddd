import {
  AbstractDomainString,
  BrokenRule,
  IDomainPrimitive,
} from '@nestjslatam/ddd-lib';

export class FullName extends AbstractDomainString {
  protected businessRules(props: IDomainPrimitive<string>): void {
    const { value } = props;

    if (value.length < 3) {
      this.addBrokenRule(
        new BrokenRule('value', 'Value must be greater than 3 characters'),
      );
    }

    if (value.length > 300) {
      this.addBrokenRule(
        new BrokenRule('value', 'Value must be less than 300 characters'),
      );
    }
  }

  static create(value: string): FullName {
    return new FullName(value);
  }
}
