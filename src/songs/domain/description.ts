import {
  BrokenRule,
  DomainGuard,
  DomainStringValueObject,
  IDomainPrimitive,
} from '@nestjslatam/ddd-lib';

export class Description extends DomainStringValueObject {
  constructor(value: string) {
    super(value);
  }

  protected businessRules(props: IDomainPrimitive<string>): void {
    if (!DomainGuard.lengthIsBetween(props.value, 3, 1000)) {
      this.addBrokenRule(
        new BrokenRule(
          'description',
          'name must be between 3 and 150 characters',
        ),
      );
    }
  }

  static create(value: string): Description {
    return new Description(value);
  }
}
