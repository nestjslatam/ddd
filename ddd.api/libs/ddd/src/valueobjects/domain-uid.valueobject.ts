import { BrokenRule } from './../models/broken-rule';
import { DomainGuard } from '../helpers';
import { DomainValueObject, IDomainPrimitive } from './domain-valueobject';

export abstract class DomainUIdValueObject extends DomainValueObject<string> {
  protected abstract businessRules(props: IDomainPrimitive<string>): void;

  protected constructor(value: string) {
    super({ value });

    this.basicBusinessRules({ value });

    this.businessRules({ value });
  }

  private basicBusinessRules(props: IDomainPrimitive<string>): void {
    const { value } = props;

    if (!DomainGuard.lenghtIsEqual(value, 36))
      this.addBrokenRule(
        new BrokenRule(
          this.constructor.name,
          'Invalid Id lenght. The value should be a string Guid with 36 characters',
        ),
      );
  }
}
