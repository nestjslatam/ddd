import { DomainInvalidArgumentException } from '../exceptions';
import { DomainGuard } from '../helpers';
import { IDomainPrimitive } from '../interfaces';
import { DomainValueObject } from './domain-valueobject';

export class DomainNumberValueObject extends DomainValueObject<number> {
  protected validate(props: IDomainPrimitive<number>): void {
    const { value } = props;

    if (DomainGuard.isEmpty(value) || !DomainGuard.isNumber(value)) {
      throw new DomainInvalidArgumentException('Value must be a number');
    }
  }

  protected constructor(value: number) {
    super({ value });
  }

  public static create(value: number) {
    return new DomainNumberValueObject(value);
  }
}
