import { DomainGuard } from '../helpers';
import { IDomainPrimitive } from '../interfaces';
import { BrokenRule } from '../models';
import { DomainValueObject } from './domain-valueobject';

export class DomainNumberValueObject extends DomainValueObject<number> {
  protected validate(props: IDomainPrimitive<number>): void {
    const { value } = props;

    if (DomainGuard.isEmpty(value) || !DomainGuard.isNumber(value)) {
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value must be a number'),
      );
    }
  }

  protected constructor(value: number) {
    super({ value });
  }

  public static create(value: number) {
    return new DomainNumberValueObject(value);
  }
}
