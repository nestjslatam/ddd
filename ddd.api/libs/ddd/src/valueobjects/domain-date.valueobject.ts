import { DomainInvalidArgumentException } from '../exceptions';
import { DomainGuard } from '../helpers';
import { IDomainPrimitive } from '../interfaces';
import { DomainValueObject } from './domain-valueobject';

export class DomainDateValueObject extends DomainValueObject<Date> {
  protected validate(props: IDomainPrimitive<Date>): void {
    const { value } = props;

    if (DomainGuard.isEmpty(value) || !DomainGuard.isDate(value))
      throw new DomainInvalidArgumentException('Value must be a date');
  }

  protected constructor(value: Date) {
    super({ value });
  }

  public static create(value: Date) {
    return new DomainDateValueObject(value);
  }
}
