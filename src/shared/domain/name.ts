import { AbstractDomainString, IDomainPrimitive } from '@nestjslatam/ddd-lib';

export class Name extends AbstractDomainString {
  protected businessRules(props: IDomainPrimitive<string>): void {
    // note: this is a good place to add business rules
    console.log(props);
  }

  static create(value: string): Name {
    return new Name(value);
  }
}
