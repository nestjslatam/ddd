import {
  BrokenRule,
  DomainGuard,
  DomainStringValueObject,
  IDomainPrimitive,
} from '@nestjslatam/ddd';

export class LastName extends DomainStringValueObject {
  constructor(name: string) {
    super(name);
  }

  static create(name: string): LastName {
    return new LastName(name);
  }

  protected businessRules(props: IDomainPrimitive<string>): void {
    const { value } = props;

    if (!DomainGuard.lengthIsBetween(value, 3, 150))
      this.addBrokenRule(
        new BrokenRule(
          this.constructor.name,
          'Invalid LastName lenght. The value should be a string with 3 and 150 characters',
        ),
      );
  }
}
