import { DomainGuard } from '../helpers';
import { BrokenRule } from '../models';
import { DomainValueObject, IDomainPrimitive } from './domain-valueobject';

export class DomainNumberValueObject extends DomainValueObject<number> {
  protected constructor(value: number) {
    super({ value });
  }

  protected businessRules(props: IDomainPrimitive<number>): void {
    const { value } = props;

    if (DomainGuard.isEmpty(value) || !DomainGuard.isNumber(value)) {
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value must be a number'),
      );
    }
  }

  public static create(value: number) {
    return new DomainNumberValueObject(value);
  }
}
