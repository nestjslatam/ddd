import {
  BrokenRule,
  DomainGuard,
  DomainStringValueObject,
  IDomainPrimitive,
} from '@nestjslatam/ddd-lib';

export class Name extends DomainStringValueObject {
  constructor(value: string) {
    super(value);
  }

  protected businessRules(props: IDomainPrimitive<string>): void {
    if (!DomainGuard.lengthIsBetween(props.value, 3, 150) === false) {
      this.addBrokenRule(
        new BrokenRule('name', 'name must be between 3 and 150 characters'),
      );
    }
  }

  static create(value: string): Name {
    return new Name(value);
  }
}
