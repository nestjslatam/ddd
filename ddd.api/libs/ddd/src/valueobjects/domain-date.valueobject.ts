import { DomainGuard } from '../helpers';
import { IDomainPrimitive } from '../interfaces';
import { BrokenRule } from '../models';
import { DomainValueObject } from './domain-valueobject';

export class DomainDateValueObject extends DomainValueObject<Date> {
  protected validate(props: IDomainPrimitive<Date>): void {
    const { value } = props;

    if (DomainGuard.isEmpty(value) || !DomainGuard.isDate(value))
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value must be a date'),
      );
  }

  protected constructor(value: Date) {
    super({ value });
  }

  public static create(value: Date) {
    return new DomainDateValueObject(value);
  }
}
