import { DomainValueObject, IDomainPrimitive } from './domain-valueobject';
import { BrokenRule } from '../core';
import { DomainGuard } from '../helpers';

export abstract class DomainDateValueObject extends DomainValueObject<Date> {
  protected abstract businessRules(props: IDomainPrimitive<Date>): void;

  protected constructor(value: Date) {
    super({ value });

    this.basicBusinessRules({ value });

    this.businessRules({ value });
  }

  protected basicBusinessRules(props: IDomainPrimitive<Date>): void {
    const { value } = props;

    if (DomainGuard.isEmpty(value) || !DomainGuard.isDate(value))
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value must be a date'),
      );
  }
}
