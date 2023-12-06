/* eslint-disable @typescript-eslint/no-unused-vars */
import { AsbtractDomainDate, IDomainPrimitive } from '@nestjslatam/ddd-lib';

export class RegisterDate extends AsbtractDomainDate {
  protected businessRules(props: IDomainPrimitive<Date>): void {
    // this is a good place to add business rules
    console.log(props);
  }

  static create(value: Date): RegisterDate {
    return new RegisterDate(value);
  }
}
