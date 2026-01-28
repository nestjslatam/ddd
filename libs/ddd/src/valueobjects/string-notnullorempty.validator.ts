import { AbstractRuleValidator } from '../core';
import { DddValueObject } from '../valueobject';

/**
 * Validator for string value objects that ensures the value is not null, undefined, or empty.
 * Provides comprehensive validation for string values with configurable whitespace handling and minimum length.
 *
 * @remarks
 * This validator checks for common string validation issues:
 * - Null or undefined values
 * - Empty strings (optional, enabled by default)
 * - Whitespace-only strings (when trimWhitespace is enabled)
 * - Minimum length requirements (optional)
 *
 * Use this validator when you need to ensure a string value object contains meaningful text.
 * Common use cases include names, codes, descriptions, and other textual data that cannot be empty.
 *
 * @example
 * ```typescript
 * // Default validation (not null, not empty)
 * class ProductName extends DddValueObject<string> {
 *   protected constructor(value: string) {
 *     super(value);
 *   }
 *
 *   override addValidators(): void {
 *     super.addValidators();
 *     // Validates not null, not undefined, not empty
 *     this.validatorRules.add(new StringNotNullOrEmptyValidator(this));
 *   }
 *
 *   static create(value: string): ProductName {
 *     return new ProductName(value);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With whitespace trimming and minimum length
 * class ProductCode extends DddValueObject<string> {
 *   override addValidators(): void {
 *     super.addValidators();
 *     this.validatorRules.add(
 *       new StringNotNullOrEmptyValidator(this, {
 *         trimWhitespace: true,
 *         minLength: 3,
 *         propertyName: 'code'
 *       })
 *     );
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Allow empty strings (only null/undefined check)
 * class OptionalDescription extends DddValueObject<string> {
 *   override addValidators(): void {
 *     super.addValidators();
 *     this.validatorRules.add(
 *       new StringNotNullOrEmptyValidator(this, { allowEmpty: true })
 *     );
 *   }
 * }
 * ```
 */
export class StringNotNullOrEmptyValidator extends AbstractRuleValidator<
  DddValueObject<string>
> {
  private readonly options: StringValidationOptions;

  /**
   * Creates a new StringNotNullOrEmptyValidator instance.
   *
   * @param subject The string value object to validate
   * @param options Optional configuration for validation behavior
   */
  constructor(
    subject: DddValueObject<string>,
    options?: Partial<StringValidationOptions>,
  ) {
    super(subject);
    this.options = {
      allowEmpty: false,
      trimWhitespace: false,
      minLength: 0,
      propertyName: 'value',
      ...options,
    };
  }

  /**
   * Executes validation rules for the string value object.
   * Checks for null, undefined, empty, whitespace, and minimum length based on configuration.
   */
  public addRules(): void {
    let value = this.subject.getValue();
    const propertyName = this.options.propertyName;

    // Check for null or undefined
    if (value === null || value === undefined) {
      this.addBrokenRule(
        propertyName,
        `${propertyName} cannot be null or undefined`,
      );
      return; // Exit early if null/undefined
    }

    // Apply trimming if configured
    if (this.options.trimWhitespace) {
      value = value.trim();
    }

    // Check for empty string if not allowed
    if (!this.options.allowEmpty && value === '') {
      this.addBrokenRule(
        propertyName,
        `${propertyName} cannot be empty${
          this.options.trimWhitespace ? ' or contain only whitespace' : ''
        }`,
      );
      return; // Exit early if empty
    }

    // Check minimum length if specified
    if (this.options.minLength > 0 && value.length < this.options.minLength) {
      this.addBrokenRule(
        propertyName,
        `${propertyName} must be at least ${this.options.minLength} character${
          this.options.minLength === 1 ? '' : 's'
        } long (current length: ${value.length})`,
      );
    }
  }
}

/**
 * Configuration options for string validation.
 */
export interface StringValidationOptions {
  /**
   * Whether to allow empty strings as valid values.
   * - `false` (default): Empty strings are invalid
   * - `true`: Empty strings are allowed (only null/undefined are invalid)
   *
   * @default false
   */
  allowEmpty: boolean;

  /**
   * Whether to trim whitespace before validation.
   * When enabled, strings with only whitespace will be considered empty.
   *
   * @default false
   */
  trimWhitespace: boolean;

  /**
   * Minimum length requirement for the string (after trimming if enabled).
   * Set to 0 to disable minimum length validation.
   *
   * @default 0
   */
  minLength: number;

  /**
   * The property name to use in validation error messages.
   *
   * @default 'value'
   */
  propertyName: string;
}
