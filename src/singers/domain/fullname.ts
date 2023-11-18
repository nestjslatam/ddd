import {
  BrokenRule,
  DomainGuard,
  DomainStringValueObject,
  IDomainPrimitive,
} from '../../../libs/ddd/src';

export class FullName extends DomainStringValueObject {
  constructor(value: string) {
    super(value);
  }

  protected businessRules(props: IDomainPrimitive<string>): void {
    if (!DomainGuard.lengthIsBetween(props.value, 3, 1000)) {
      this.addBrokenRule(
        new BrokenRule('name', 'name must be between 3 and 1000 characters'),
      );
    }
  }

  static create(value: string): FullName {
    return new FullName(value);
  }

  static load(value: string): FullName {
    return new FullName(value);
  }
}
