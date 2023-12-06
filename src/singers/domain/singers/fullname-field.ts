import { AbstractDomainString, IDomainPrimitive } from '@nestjslatam/ddd-lib';

export class FullName extends AbstractDomainString {
  protected businessRules(props: IDomainPrimitive<string>): void {
    // this is a good place to add business rules
    console.log(props);
  }

  static create(value: string): FullName {
    return new FullName(value);
  }

  static load(value: string): FullName {
    return new FullName(value);
  }
}
