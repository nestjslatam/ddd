import { BrokenRule } from '../core';
import { DomainGuard } from '../helpers';
import { DomainValueObject, IDomainPrimitive } from './domain-valueobject';

export abstract class DomainStringValueObject extends DomainValueObject<string> {
  protected abstract businessRules(props: IDomainPrimitive<string>): void;

  protected constructor(value: string) {
    super({ value });

    this.basicBusinessRules({ value });

    this.businessRules({ value });
  }

  protected basicBusinessRules(props: IDomainPrimitive<string>): void {
    const { value } = props;

    if (DomainGuard.isEmpty(value) || !DomainGuard.isString(value)) {
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value must be a string'),
      );
    }
  }
}
