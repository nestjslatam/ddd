import { v4 as uuidv4 } from 'uuid';

import { DomainGuard } from '../helpers';
import { DomainValueObject } from './domain-valueobject';
import { DomainException } from '../exceptions';
import { IDomainPrimitive } from '../interfaces';

export class DomainUuidValueObject extends DomainValueObject<string> {
  protected validate(props: IDomainPrimitive<string>): void {
    const { value } = props;

    if (DomainGuard.isEmpty(value) || !DomainGuard.lenghtIsEqual(value, 36))
      throw new DomainException('Invalid lenght Guid');
  }

  protected constructor(props: IDomainPrimitive<string>) {
    super(props);
  }

  public static create(): DomainUuidValueObject {
    try {
      const id = uuidv4();

      return new DomainUuidValueObject({ value: id });
    } catch (error) {
      throw new DomainException(error.message);
    }
  }

  public static setId(id: string) {
    return new DomainUuidValueObject({ value: id });
  }
}
