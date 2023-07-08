import {
  BrokenRule,
  DomainGuard,
  DomainStringValueObject,
  IDomainPrimitive,
} from '@nestjslatam/ddd';

export class FirstName extends DomainStringValueObject {
  constructor(name: string) {
    super(name);
  }

  static create(name: string): FirstName {
    return new FirstName(name);
  }

  protected businessRules(props: IDomainPrimitive<string>): void {
    const { value } = props;

    if (!DomainGuard.lengthIsBetween(value, 3, 150))
      this.addBrokenRule(
        new BrokenRule(
          this.constructor.name,
          'Invalid FirstName lenght. The value should be a string with 3 and 150 characters',
        ),
      );
  }
}
