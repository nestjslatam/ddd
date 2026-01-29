import { DddValueObject } from '../valueobject';
import { NumberNotNullValidator } from './number-notnull.validator';
import { NumberPositiveValidator } from './number-positive.validator';

/**
 * Base value object for representing numeric values in the domain.
 * Provides configurable validation and utility methods for working with numbers.
 *
 * @remarks
 * This class follows the Factory Method pattern with protected constructor.
 * By default, it validates that numbers are not null and are positive (> 0).
 * Validation behavior can be customized through configuration options.
 *
 * Key features:
 * - Configurable validation (positive, non-negative, allow zero, etc.)
 * - Immutable once created
 * - Value-based equality comparison
 * - Utility methods for common numeric operations
 * - Extensible for specific domain numeric types
 *
 * Default validation (without options):
 * - Not null or undefined
 * - Not NaN
 * - Not Infinity
 * - Must be positive (> 0)
 *
 * @example
 * ```typescript
 * // Create with default validation (positive numbers only)
 * const price = NumberValueObject.create(99.99);
 * console.log(price.isPositive()); // true
 *
 * // Create allowing zero (non-negative numbers)
 * const quantity = NumberValueObject.create(0, { allowZero: true });
 * console.log(quantity.isZero()); // true
 *
 * // Create allowing negative numbers (no positivity check)
 * const temperature = NumberValueObject.create(-10, { requirePositive: false });
 * console.log(temperature.isNegative()); // true
 * ```
 *
 * @example
 * ```typescript
 * // Extend for specific domain types
 * class Price extends NumberValueObject {
 *   protected constructor(value: number) {
 *     super(value, { requirePositive: true, allowZero: false });
 *   }
 *
 *   static create(value: number): Price {
 *     return new Price(value);
 *   }
 *
 *   // Domain-specific methods
 *   applyDiscount(percentage: number): Price {
 *     const discountedValue = this.getValue() * (1 - percentage / 100);
 *     return Price.create(discountedValue);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Extend for quantities that allow zero
 * class Quantity extends NumberValueObject {
 *   protected constructor(value: number) {
 *     super(value, { requirePositive: true, allowZero: true });
 *   }
 *
 *   static create(value: number): Quantity {
 *     return new Quantity(value);
 *   }
 *
 *   static zero(): Quantity {
 *     return new Quantity(0);
 *   }
 * }
 * ```
 */
export class NumberValueObject extends DddValueObject<number> {
  private readonly options: NumberValueObjectOptions;

  /**
   * Creates a new NumberValueObject instance.
   *
   * @param value The numeric value to wrap
   * @param options Optional configuration for validation behavior
   *
   * ⚠️ Constructor is protected. Use static factory methods (create, load) instead.
   */
  protected constructor(
    value: number,
    options?: Partial<NumberValueObjectOptions>,
  ) {
    super(value);
    this.options = {
      requirePositive: true,
      allowZero: false,
      allowNaN: false,
      allowInfinity: false,
      epsilon: 0,
      ...options,
    };
  }

  /**
   * Creates a new number value object with validation.
   *
   * @param value The numeric value to wrap
   * @param options Optional configuration for validation behavior
   * @returns A new NumberValueObject instance
   *
   * @throws {BrokenRulesException} If validation fails
   */
  static create(
    value: number,
    options?: Partial<NumberValueObjectOptions>,
  ): NumberValueObject {
    return new NumberValueObject(value, options);
  }

  /**
   * Loads an existing number value object with validation.
   * Semantically indicates loading from persistence.
   *
   * @param value The numeric value to load
   * @param options Optional configuration for validation behavior
   * @returns A new NumberValueObject instance
   *
   * @throws {BrokenRulesException} If validation fails
   */
  static load(
    value: number,
    options?: Partial<NumberValueObjectOptions>,
  ): NumberValueObject {
    return new NumberValueObject(value, options);
  }

  /**
   * Creates a number value object with value zero.
   * Only valid when allowZero is true.
   *
   * @param options Optional configuration for validation behavior (allowZero must be true)
   * @returns A new NumberValueObject with value 0
   *
   * @throws {BrokenRulesException} If allowZero is false
   */
  static zero(options?: Partial<NumberValueObjectOptions>): NumberValueObject {
    return new NumberValueObject(0, { ...options, allowZero: true });
  }

  /**
   * Creates a number value object with value one.
   *
   * @param options Optional configuration for validation behavior
   * @returns A new NumberValueObject with value 1
   */
  static one(options?: Partial<NumberValueObjectOptions>): NumberValueObject {
    return new NumberValueObject(1, options);
  }

  /**
   * Checks if the value is zero.
   *
   * @returns True if the value equals zero, false otherwise
   */
  isZero(): boolean {
    return this.getValue() === 0;
  }

  /**
   * Checks if the value is positive (greater than zero).
   *
   * @returns True if the value is greater than zero, false otherwise
   */
  isPositive(): boolean {
    return this.getValue() > 0;
  }

  /**
   * Checks if the value is negative (less than zero).
   *
   * @returns True if the value is less than zero, false otherwise
   */
  isNegative(): boolean {
    return this.getValue() < 0;
  }

  /**
   * Gets the primitive numeric value.
   * Alias for getValue() for better readability.
   *
   * @returns The numeric value
   */
  toNumber(): number {
    return this.getValue();
  }

  /**
   * Converts the value object to a string representation.
   *
   * @returns String representation of the numeric value
   */
  toString(): string {
    return this.getValue().toString();
  }

  /**
   * Converts the value object to JSON representation.
   *
   * @returns The numeric value for JSON serialization
   */
  toJSON(): number {
    return this.getValue();
  }

  /**
   * Gets the components used for equality comparison.
   * Returns the numeric value as the only component.
   *
   * @returns An iterable containing the numeric value
   */
  protected getEqualityComponents(): Iterable<any> {
    return [this.getValue()];
  }

  /**
   * Adds validators based on configuration options.
   * Override this method to add custom validators in derived classes.
   */
  override addValidators(): void {
    super.addValidators();

    // Always add null/NaN/Infinity validator (respecting options)
    this.validatorRules.add(
      new NumberNotNullValidator(this, {
        allowNaN: this.options.allowNaN,
        allowInfinity: this.options.allowInfinity,
      }),
    );

    // Add positive validator only if required
    if (this.options.requirePositive) {
      this.validatorRules.add(
        new NumberPositiveValidator(this, {
          allowZero: this.options.allowZero,
          epsilon: this.options.epsilon,
        }),
      );
    }
  }
}

/**
 * Configuration options for number value object validation.
 */
export interface NumberValueObjectOptions {
  /**
   * Whether to require the number to be positive (> 0) or non-negative (>= 0).
   * When true, adds NumberPositiveValidator.
   *
   * @default true
   */
  requirePositive: boolean;

  /**
   * Whether to allow zero as a valid value when requirePositive is true.
   * - `false` (default): Value must be strictly positive (> 0)
   * - `true`: Value must be non-negative (>= 0)
   *
   * Only applicable when requirePositive is true.
   *
   * @default false
   */
  allowZero: boolean;

  /**
   * Whether to allow NaN (Not a Number) values.
   *
   * @default false
   */
  allowNaN: boolean;

  /**
   * Whether to allow Infinity and -Infinity values.
   *
   * @default false
   */
  allowInfinity: boolean;

  /**
   * Epsilon value for floating-point comparison tolerance.
   * Useful for handling floating-point precision issues in JavaScript.
   *
   * Only applicable when requirePositive is true.
   *
   * @default 0
   */
  epsilon: number;
}
