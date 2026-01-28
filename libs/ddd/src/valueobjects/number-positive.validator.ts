import { AbstractRuleValidator } from '../core/validator-rules/impl/abstract-rule-validator';
import { DddValueObject } from '../valueobject';

/**
 * Validator for number value objects that ensures the value is positive (or non-negative).
 * Provides flexible validation for numeric values that must be greater than zero or greater than or equal to zero.
 *
 * @remarks
 * This validator checks that a number meets positivity requirements:
 * - By default, validates that the value is strictly positive (> 0)
 * - Can be configured to allow zero (>= 0) through the `allowZero` option
 * - Handles edge cases like null, undefined, NaN, and Infinity
 * - Supports epsilon-based comparison for floating-point numbers
 *
 * Use this validator when you need to ensure a number value object contains a positive or non-negative value.
 * Common use cases include prices, quantities, ages, counts, and other metrics that cannot be negative.
 *
 * @example
 * ```typescript
 * // Strictly positive validation (default behavior)
 * class Price extends DddValueObject<number> {
 *   protected constructor(value: number) {
 *     super(value);
 *   }
 *
 *   override addValidators(): void {
 *     super.addValidators();
 *     // Value must be > 0
 *     this.validatorRules.add(new NumberPositiveValidator(this));
 *   }
 *
 *   static create(value: number): Price {
 *     return new Price(value);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Allow zero (non-negative validation)
 * class Quantity extends DddValueObject<number> {
 *   override addValidators(): void {
 *     super.addValidators();
 *     // Value must be >= 0
 *     this.validatorRules.add(
 *       new NumberPositiveValidator(this, { allowZero: true })
 *     );
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Custom property name and floating-point epsilon
 * class Balance extends DddValueObject<number> {
 *   override addValidators(): void {
 *     super.addValidators();
 *     this.validatorRules.add(
 *       new NumberPositiveValidator(this, {
 *         allowZero: true,
 *         propertyName: 'balance',
 *         epsilon: 0.001
 *       })
 *     );
 *   }
 * }
 * ```
 */
export class NumberPositiveValidator extends AbstractRuleValidator<
  DddValueObject<number>
> {
  private readonly options: NumberPositiveValidationOptions;

  /**
   * Creates a new NumberPositiveValidator instance.
   *
   * @param subject The number value object to validate
   * @param options Optional configuration for validation behavior
   */
  constructor(
    subject: DddValueObject<number>,
    options?: Partial<NumberPositiveValidationOptions>,
  ) {
    super(subject);
    this.options = {
      allowZero: false,
      propertyName: 'value',
      epsilon: 0,
      ...options,
    };
  }

  /**
   * Executes validation rules for the number value object.
   * Checks that the value is positive or non-negative based on configuration.
   */
  public addRules(): void {
    const value = this.subject.getValue();
    const propertyName = this.options.propertyName;

    // Check for invalid numeric states first
    if (value === null || value === undefined) {
      this.addBrokenRule(
        propertyName,
        `${propertyName} cannot be null or undefined`,
      );
      return; // Exit early if null/undefined
    }

    if (Number.isNaN(value)) {
      this.addBrokenRule(propertyName, `${propertyName} cannot be NaN`);
      return; // Exit early if NaN
    }

    if (!Number.isFinite(value)) {
      this.addBrokenRule(
        propertyName,
        `${propertyName} must be a finite number`,
      );
      return; // Exit early if Infinity
    }

    // Validate positivity based on configuration
    if (this.options.allowZero) {
      // Non-negative validation (>= 0)
      if (value < -this.options.epsilon) {
        this.addBrokenRule(
          propertyName,
          `${propertyName} must be non-negative (greater than or equal to zero)`,
        );
      }
    } else {
      // Strictly positive validation (> 0)
      if (value <= this.options.epsilon) {
        this.addBrokenRule(
          propertyName,
          `${propertyName} must be a positive number (greater than zero)`,
        );
      }
    }
  }
}

/**
 * Configuration options for positive number validation.
 */
export interface NumberPositiveValidationOptions {
  /**
   * Whether to allow zero as a valid value.
   * - `false` (default): Value must be strictly positive (> 0)
   * - `true`: Value must be non-negative (>= 0)
   *
   * @default false
   */
  allowZero: boolean;

  /**
   * The property name to use in validation error messages.
   *
   * @default 'value'
   */
  propertyName: string;

  /**
   * Epsilon value for floating-point comparison tolerance.
   * Useful for handling floating-point precision issues in JavaScript.
   *
   * When set to a small positive value (e.g., 0.001), the validator will consider
   * values within this threshold as acceptable. For example:
   * - With epsilon = 0.001 and allowZero = false: values > 0.001 are valid
   * - With epsilon = 0.001 and allowZero = true: values >= -0.001 are valid
   *
   * @default 0
   */
  epsilon: number;
}
