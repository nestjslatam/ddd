import { v4 as uuidv4 } from 'uuid';

import { BrokenRule } from './../models/broken-rule';
import { DomainGuard } from '../helpers';
import { DomainValueObject, IDomainPrimitive } from './domain-valueobject';

export class DomainIdValueObject extends DomainValueObject<string> {
  protected constructor(value: string) {
    super({ value });
  }

  protected businessRules(props: IDomainPrimitive<string>): void {
    const { value } = props;

    if (!DomainGuard.lenghtIsEqual(value, 36))
      this.addBrokenRule(
        new BrokenRule(
          this.constructor.name,
          'Invalid Id lenght. The value should be a string Guid with 36 characters',
        ),
      );
  }

  public static create(): DomainIdValueObject {
    return new DomainIdValueObject(uuidv4());
  }

  public static setValue(value: string) {
    return new DomainIdValueObject(value);
  }
}
