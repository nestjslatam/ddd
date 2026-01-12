import { BrokenRule } from '../ddd-core';
import { BrokenRulesException } from '../ddd-exceptions';
import { ValueObjectValidator } from '../ddd-validators';
import {
  AbstractDomainValueObject,
  IDomainPrimitive,
} from '../ddd-core/ddd-base-classes';

/**
 * Abstract base class for domain date value objects.
 * Represents a date value within the domain model.
 * Extends the AbstractDomainValueObject class.
 */
export abstract class AsbtractDomainDate extends AbstractDomainValueObject<Date> {
  /**
   * Abstract method to define business rules for the domain date value object.
   * Subclasses must implement this method to define their specific business rules.
   * @param props - The properties of the domain date value object.
   */
  protected abstract businessRules(props: IDomainPrimitive<Date>): void;

  /**
   * Constructor for the abstract domain date value object.
   * Initializes the value and applies internal and business rules.
   * @param value - The value of the domain date value object.
   */
  protected constructor(value: Date) {
    super({ value });

    this.internalRules({ value });
    this.internalRules({ value });
    this.businessRules({ value });

    if (!this.isValid) {
      throw new BrokenRulesException(this.getBrokenRules.asString());
    }
  }

  /**
   * Internal rules for the domain date value object.
   * Validates that the value is not undefined or null.
   * Adds a broken rule if the value is invalid.
   * @param props - The properties of the domain date value object.
   */
  protected internalRules(props: IDomainPrimitive<Date>): void {
    const { value } = props;

    if (!(value instanceof Date))
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value must be a date'),
      );
  }
}
