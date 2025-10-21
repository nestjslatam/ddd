import { AsbtractDomainDate, IDomainPrimitive } from '@nestjslatam/ddd-lib';

export class SubscribedDate extends AsbtractDomainDate {
  protected businessRules(props: IDomainPrimitive<Date>): void {
    // this is a good place to add business rules
    console.log(props);
  }

  static create(value: Date): SubscribedDate {
    return new SubscribedDate(value);
  }
}
