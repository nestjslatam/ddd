import { AbstractRuleValidator } from '../core/validator-rules/impl/abstract-rule-validator';
import { DddValueObject } from '../valueobject';

/**
 * Validator for number value objects that ensures the value is not null, undefined, NaN, or Infinity.
 * Provides comprehensive validation for numeric values to prevent invalid states.
 *
 * @remarks
 * This validator checks for common numeric validation issues:
 * - Null or undefined values
 * - NaN (Not a Number) values (optional, enabled by default)
 * - Infinity values (optional, enabled by default)
 *
 * Use this validator when you need to ensure a number value object contains a valid, finite number.
 *
 * @example
 * ```typescript
 * class Age extends DddValueObject<number> {
 *   protected constructor(value: number) {
 *     super(value);
 *   }
 *
 *   override addValidators(): void {
 *     super.addValidators();
 *     // Validates not null, not undefined, not NaN, not Infinity
 *     this.validatorRules.add(new NumberNotNullValidator(this));
 *   }
 *
 *   static create(value: number): Age {
 *     return new Age(value);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Allow Infinity but not NaN
 * class Score extends DddValueObject<number> {
 *   override addValidators(): void {
 *     super.addValidators();
 *     this.validatorRules.add(
 *       new NumberNotNullValidator(this, { allowInfinity: true, allowNaN: false })
 *     );
 *   }
 * }
 * ```
 */
export class NumberNotNullValidator extends AbstractRuleValidator<
  DddValueObject<number>
> {
  private readonly options: NumberValidationOptions;

  /**
   * Creates a new NumberNotNullValidator instance.
   *
   * @param subject The number value object to validate
   * @param options Optional configuration for validation behavior
   */
  constructor(
    subject: DddValueObject<number>,
    options?: Partial<NumberValidationOptions>,
  ) {
    super(subject);
    this.options = {
      allowNaN: false,
      allowInfinity: false,
      propertyName: 'value',
      ...options,
    };
  }

  /**
   * Executes validation rules for the number value object.
   * Checks for null, undefined, NaN, and Infinity based on configuration.
   */
  public addRules(): void {
    const value = this.subject.getValue();
    const propertyName = this.options.propertyName;

    // Check for null or undefined
    if (value === null || value === undefined) {
      this.addBrokenRule(
        propertyName,
        `${propertyName} cannot be null or undefined`,
      );
      return; // Exit early if null/undefined
    }

    // Check for NaN if not allowed
    if (!this.options.allowNaN && Number.isNaN(value)) {
      this.addBrokenRule(propertyName, `${propertyName} cannot be NaN`);
    }

    // Check for Infinity if not allowed
    if (!this.options.allowInfinity && !Number.isFinite(value)) {
      this.addBrokenRule(
        propertyName,
        `${propertyName} must be a finite number`,
      );
    }
  }
}

/**
 * Configuration options for number validation.
 */
export interface NumberValidationOptions {
  /**
   * Whether to allow NaN (Not a Number) values.
   * @default false
   */
  allowNaN: boolean;

  /**
   * Whether to allow Infinity and -Infinity values.
   * @default false
   */
  allowInfinity: boolean;

  /**
   * The property name to use in validation error messages.
   * @default 'value'
   */
  propertyName: string;
}
