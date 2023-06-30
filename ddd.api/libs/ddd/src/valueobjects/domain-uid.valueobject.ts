import { v4 as uuidv4 } from 'uuid';

import { BrokenRule } from './../models/broken-rule';
import { DomainGuard } from '../helpers';
import { DomainValueObject } from './domain-valueobject';
import { IDomainPrimitive } from '../interfaces';

export class DomainIdValueObject extends DomainValueObject<string> {
  protected validate(props: IDomainPrimitive<string>): void {
    const { value } = props;

    if (!DomainGuard.lenghtIsEqual(value, 36))
      this.addBrokenRule(
        new BrokenRule(
          this.constructor.name,
          'Invalid Id lenght. The value should be a string Guid with 36 characters',
        ),
      );
  }

  protected constructor(value: string) {
    super({ value });
  }

  public static create(): DomainIdValueObject {
    return new DomainIdValueObject(uuidv4());
  }

  public static setValue(value: string) {
    return new DomainIdValueObject(value);
  }
}
