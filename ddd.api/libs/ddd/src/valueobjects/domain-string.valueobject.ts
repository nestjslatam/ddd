import { IDomainPrimitive } from '../interfaces';
import { DomainGuard } from '../helpers';
import { DomainValueObject } from './domain-valueobject';
import { BrokenRule } from '../models';

export class DomainStringValueObject extends DomainValueObject<string> {
  protected validate(props: IDomainPrimitive<string>): void {
    const { value } = props;

    if (DomainGuard.isEmpty(value) || !DomainGuard.isString(value)) {
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value must be a string'),
      );
    }
  }

  protected constructor(value: string) {
    super({ value });
  }

  public static create(value: string) {
    return new DomainStringValueObject(value);
  }
}
