import { DomainGuard } from '../helpers';
import { BrokenRule } from '../models';
import { DomainValueObject, IDomainPrimitive } from './domain-valueobject';

export abstract class DomainNumberValueObject extends DomainValueObject<number> {
  protected abstract businessRules(props: IDomainPrimitive<number>): void;

  protected constructor(value: number) {
    super({ value });

    this.basicBusinessRules({ value });

    this.businessRules({ value });
  }

  protected basicBusinessRules(props: IDomainPrimitive<number>): void {
    const { value } = props;

    if (DomainGuard.isEmpty(value) || !DomainGuard.isNumber(value)) {
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value must be a number'),
      );
    }
  }
}
