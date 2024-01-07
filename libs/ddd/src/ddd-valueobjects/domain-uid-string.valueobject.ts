/**
 * Represents a domain value object that holds a unique identifier as a string.
 * This value object ensures that the provided value is not null, undefined, and follows the UUID v4 pattern.
 */
import { BrokenRule } from '../ddd-core';
import { ValueObjectValidator } from '../ddd-validators';
import {
  AbstractDomainValueObject,
  IDomainPrimitive,
} from '../ddd-valueobject';

const UUID_V4_PATTERN =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export class DomainIdAsString extends AbstractDomainValueObject<string> {
  protected constructor(value: string) {
    super({ value });

    this.businessRules({ value });
  }

  /**
   * Creates a new instance of DomainIdAsString with the provided value.
   * @param value - The value of the domain identifier as a string.
   * @returns A new instance of DomainIdAsString.
   */
  public static create(value: string): DomainIdAsString {
    return new DomainIdAsString(value);
  }

  /**
   * Loads an existing instance of DomainIdAsString with the provided value.
   * @param value - The value of the domain identifier as a string.
   * @returns An existing instance of DomainIdAsString.
   */
  public static load(value: string): DomainIdAsString {
    return new DomainIdAsString(value);
  }

  /**
   * Gets the value of the domain identifier as a string.
   * @returns The value of the domain identifier as a string.
   */
  protected businessRules(props: IDomainPrimitive<string>): void {
    const { value } = props;

    if (ValueObjectValidator.isUndefinedOrNull(value))
      this.addBrokenRule(
        new BrokenRule(
          this.constructor.name,
          'Value is required and cannot be null or undefined.',
        ),
      );

    const isRegexValid = new RegExp(UUID_V4_PATTERN);

    if (isRegexValid.test(value))
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Value is not a valid UUID v4.'),
      );
  }
}
