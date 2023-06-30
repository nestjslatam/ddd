import { DomainGuard } from '../helpers';
import { DomainValueObject, IDomainPrimitive } from './domain-valueobject';
import { BrokenRule } from '../models';

export class DomainStringValueObject extends DomainValueObject<string> {
  protected constructor(value: string) {
    super({ value });
  }

  public static create(value: string) {
    return new DomainStringValueObject(value);
  }

  protected businessRules(props: IDomainPrimitive<string>): void {
    const { value } = props;

    if (DomainGuard.isEmpty(value) || !DomainGuard.isString(value)) {
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value must be a string'),
      );
    }
  }
}
