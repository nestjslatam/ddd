import { BrokenRule } from '../ddd-core';
import { ValueObjectValidator } from '../ddd-validators';
import {
  AbstractDomainValueObject,
  IDomainPrimitive,
} from '../ddd-valueobject';

export abstract class AsbtractDomainDate extends AbstractDomainValueObject<Date> {
  protected abstract businessRules(props: IDomainPrimitive<Date>): void;

  protected constructor(value: Date) {
    super({ value });

    this.internalRules({ value });
    this.businessRules({ value });
  }

  protected internalRules(props: IDomainPrimitive<Date>): void {
    const { value } = props;

    if (!ValueObjectValidator.isUndefinedOrNull(value))
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value must be a date'),
      );
  }
}
