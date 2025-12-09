import { BrokenRule } from '../ddd-core';
import { ValueObjectValidator } from '../ddd-validators';
import {
  AbstractDomainValueObject,
  IDomainPrimitive,
} from '../ddd-core/ddd-base-classes';

/**
 * Abstract base class for domain number value objects.
 * Represents a number value within the domain model.
 * Extends the AbstractDomainValueObject class.
 */
export abstract class AbstractDomainNumber extends AbstractDomainValueObject<number> {
  protected abstract businessRules(props: IDomainPrimitive<number>): void;

  /**
   * Constructor for the abstract domain number value object.
   * Initializes the value and applies internal and business rules.
   * @param value - The value of the domain number value object.
   */
  protected constructor(value: number) {
    super({ value });
    this.internalRules({ value });
    this.businessRules({ value });
  }

  /**
   * Internal rules for the domain number value object.
   * Validates that the value is not undefined or null.
   * Adds a broken rule if the value is invalid.
   * @param props - The properties of the domain number value object.
   */
  protected internalRules(props: IDomainPrimitive<number>): void {
    const { value } = props;

    if (
      typeof value !== 'number' ||
      ValueObjectValidator.isUndefinedOrNull(value)
    ) {
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value must be a number'),
      );
    }
  }
}
