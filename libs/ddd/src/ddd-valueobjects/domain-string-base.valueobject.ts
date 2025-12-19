import { BrokenRule } from '../ddd-core';
import { ValueObjectValidator } from '../ddd-validators';
import {
  AbstractDomainValueObject,
  IDomainPrimitive,
} from '../ddd-core/ddd-base-classes';

/**
 * Abstract base class for domain string value objects.
 * Represents a string value within the domain model.
 * Extends the AbstractDomainValueObject class.
 */
export abstract class AbstractDomainString extends AbstractDomainValueObject<string> {
  /**
   * Abstract method to define business rules for the domain string value object.
   * Subclasses must implement this method to define their specific business rules.
   * @param props - The properties of the domain string value object.
   */
  protected abstract businessRules(props: IDomainPrimitive<string>): void;

  /**
   * Constructor for the abstract domain string value object.
   */
  protected constructor(value: string) {
    super({ value });

    this.internalRules({ value });

    this.businessRules({ value });
  }

  /**
   * Internal rules for the domain string value object.
   * Validates that the value is not undefined or null.
   * Adds a broken rule if the value is invalid.
   * @param props - The properties of the domain string value object.
   */
  protected internalRules(props: IDomainPrimitive<string>): void {
    const { value } = props;

    if (
      typeof value !== 'string' ||
      ValueObjectValidator.isUndefinedOrNull(value)
    ) {
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value must be a string'),
      );
    }
  }
}
