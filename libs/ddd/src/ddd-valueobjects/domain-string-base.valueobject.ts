import { BrokenRule } from '../ddd-core';
import { ValueObjectValidator } from '../ddd-validators';
import {
  AbstractDomainValueObject,
  IDomainPrimitive,
} from '../ddd-valueobject';

export abstract class AbstractDomainString extends AbstractDomainValueObject<string> {
  protected abstract businessRules(props: IDomainPrimitive<string>): void;

  protected constructor(value: string) {
    super({ value });

    this.internalRules({ value });

    this.businessRules({ value });
  }

  protected internalRules(props: IDomainPrimitive<string>): void {
    const { value } = props;

    if (
      typeof value !== 'string' ||
      ValueObjectValidator.isUndefinedOrNull(value)
    ) {
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value must be a string'),
      );
    }
  }
}
