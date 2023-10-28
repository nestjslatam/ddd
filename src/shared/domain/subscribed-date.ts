/* eslint-disable @typescript-eslint/no-unused-vars */
import { DomainDateValueObject, IDomainPrimitive } from '@nestjslatam/ddd-lib';

export class SubscribedDate extends DomainDateValueObject {
  protected businessRules(props: IDomainPrimitive<Date>): void {
    //
  }

  constructor(value: Date) {
    super(value);
  }

  static create(value: Date): SubscribedDate {
    return new SubscribedDate(value);
  }
}
