import { IDomainPrimitive } from '@nestjslatam/ddd';
import { DomainGuard } from '../helpers';
import { BrokenRule } from '../models';
import { DomainValueObject } from './domain-valueobject';

export class DomainDateValueObject extends DomainValueObject<Date> {
  protected constructor(value: Date) {
    super({ value });
  }

  protected businessRules(props: IDomainPrimitive<Date>): void {
    const { value } = props;

    if (DomainGuard.isEmpty(value) || !DomainGuard.isDate(value))
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value must be a date'),
      );
  }

  public static create(value: Date) {
    return new DomainDateValueObject(value);
  }
}
