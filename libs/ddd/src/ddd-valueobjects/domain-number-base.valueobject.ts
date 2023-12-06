import { BrokenRule } from '../ddd-core';
import { ValueObjectValidator } from '../ddd-validators';
import {
  AbstractDomainValueObject,
  IDomainPrimitive,
} from '../ddd-valueobject';

export abstract class AbstractDomainNumber extends AbstractDomainValueObject<number> {
  protected abstract businessRules(props: IDomainPrimitive<number>): void;

  protected constructor(value: number) {
    super({ value });
    this.internalRules({ value });
    this.businessRules({ value });
  }

  protected internalRules(props: IDomainPrimitive<number>): void {
    const { value } = props;

    if (
      typeof value !== 'number' ||
      ValueObjectValidator.isUndefinedOrNull(value)
    ) {
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value must be a number'),
      );
    }
  }
}
