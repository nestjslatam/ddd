import { DomainInvalidArgumentException } from '../exceptions';
import { IDomainPrimitive } from '../interfaces';
import { DomainGuard } from '../helpers';
import { DomainValueObject } from './domain-valueobject';

export class DomainStringValueObject extends DomainValueObject<string> {
  protected validate(props: IDomainPrimitive<string>): void {
    const { value } = props;

    if (DomainGuard.isEmpty(value) || !DomainGuard.isString(value)) {
      throw new DomainInvalidArgumentException('Value must be a string');
    }
  }

  protected constructor(value: string) {
    super({ value });
  }

  public static create(value: string) {
    return new DomainStringValueObject(value);
  }
}
