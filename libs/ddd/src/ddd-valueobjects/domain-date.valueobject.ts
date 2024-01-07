import { BrokenRule } from '../ddd-core';
import { ValueObjectValidator } from '../ddd-validators';
import {
  AbstractDomainValueObject,
  IDomainPrimitive,
} from '../ddd-valueobject';

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
    this.businessRules({ value });
  }

  /**
   * Internal rules for the domain date value object.
   * Validates that the value is not undefined or null.
   * Adds a broken rule if the value is invalid.
   * @param props - The properties of the domain date value object.
   */
  protected internalRules(props: IDomainPrimitive<Date>): void {
    const { value } = props;

    if (!ValueObjectValidator.isUndefinedOrNull(value))
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value must be a date'),
      );
  }
}
