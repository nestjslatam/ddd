import { AbstractRuleValidator } from '../core/validator-rules/impl/abstract-rule-validator';
import { DddValueObject } from '../valueobject';
import { StringNotNullOrEmptyValidator } from './string-notnullorempty.validator';

/**
 * Base value object for representing string values in the domain.
 * Provides configurable validation and utility methods for working with text.
 *
 * @remarks
 * This class follows the Factory Method pattern with protected constructor.
 * By default, it validates that strings are not null, undefined, or empty.
 * Validation behavior can be customized through configuration options.
 *
 * Key features:
 * - Configurable validation (empty allowed, whitespace trimming, length constraints)
 * - Immutable once created
 * - Value-based equality comparison
 * - Utility methods for common string operations
 * - Extensible for specific domain string types
 *
 * Default validation (without options):
 * - Not null or undefined
 * - Not empty string
 *
 * @example
 * ```typescript
 * // Create with default validation (not null, not empty)
 * const name = StringValueObject.create('John Doe');
 * console.log(name.length); // 8
 * console.log(name.toUpperCase()); // 'JOHN DOE'
 *
 * // Create allowing empty strings
 * const description = StringValueObject.create('', { allowEmpty: true });
 * console.log(description.isEmpty()); // true
 *
 * // Create with length constraints
 * const code = StringValueObject.create('ABC123', {
 *   trimWhitespace: true,
 *   minLength: 3,
 *   maxLength: 10
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Extend for specific domain types
 * class Email extends StringValueObject {
 *   protected constructor(value: string) {
 *     super(value, {
 *       trimWhitespace: true,
 *       minLength: 5,
 *       maxLength: 255
 *     });
 *   }
 *
 *   static create(value: string): Email {
 *     const email = new Email(value);
 *     // Additional email-specific validation
 *     if (!email.contains('@')) {
 *       throw new Error('Invalid email format');
 *     }
 *     return email;
 *   }
 *
 *   getDomain(): string {
 *     return this.getValue().split('@')[1];
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Extend for product codes with strict formatting
 * class ProductCode extends StringValueObject {
 *   protected constructor(value: string) {
 *     super(value, {
 *       trimWhitespace: true,
 *       minLength: 3,
 *       maxLength: 20
 *     });
 *   }
 *
 *   static create(value: string): ProductCode {
 *     return new ProductCode(value.toUpperCase());
 *   }
 *
 *   static load(value: string): ProductCode {
 *     return new ProductCode(value);
 *   }
 * }
 * ```
 */
export class StringValueObject extends DddValueObject<string> {
  private readonly options: StringValueObjectOptions;

  /**
   * Creates a new StringValueObject instance.
   *
   * @param value The string value to wrap
   * @param options Optional configuration for validation behavior
   *
   * ⚠️ Constructor is protected. Use static factory methods (create, load) instead.
   */
  protected constructor(
    value: string,
    options?: Partial<StringValueObjectOptions>,
  ) {
    super(value);
    this.options = { ...DEFAULT_STRING_OPTIONS, ...options };

    // super() already ran addValidators() and validate() -- before `options`
    // existed, so that pass built the validators from the defaults. Rebuild now
    // that the real configuration is available, otherwise allowEmpty,
    // trimWhitespace, minLength and maxLength are silently ignored and empty()
    // returns an *invalid* value object.
    //
    // These three lines are deliberately identical to NumberValueObject's,
    // which had this exact defect first. Keep the two bases in the same shape
    // so a fix to one is obviously portable to the other.
    this.validatorRules.clear();
    this.addValidators();
    this.validate();
  }

  /**
   * The effective options, safe to read during construction.
   *
   * DddValueObject's constructor calls addValidators() before this subclass's
   * constructor body has run, so `this.options` is still undefined on that
   * first pass. Falling back to the shared defaults keeps that pass correct;
   * the constructor rebuilds the validators straight afterwards with whatever
   * options were actually supplied.
   */
  private get effectiveOptions(): StringValueObjectOptions {
    return this.options ?? DEFAULT_STRING_OPTIONS;
  }

  /**
   * Creates a new string value object with validation.
   *
   * @param value The string value to wrap
   * @param options Optional configuration for validation behavior
   * @returns A new StringValueObject instance
   *
   * @throws {BrokenRulesException} If validation fails
   */
  public static create(
    value: string,
    options?: Partial<StringValueObjectOptions>,
  ): StringValueObject {
    return new StringValueObject(value, options);
  }

  /**
   * Loads an existing string value object with validation.
   * Semantically indicates loading from persistence.
   *
   * @param value The string value to load
   * @param options Optional configuration for validation behavior
   * @returns A new StringValueObject instance
   *
   * @throws {BrokenRulesException} If validation fails
   */
  public static load(
    value: string,
    options?: Partial<StringValueObjectOptions>,
  ): StringValueObject {
    return new StringValueObject(value, options);
  }

  /**
   * Creates a string value object with empty string value.
   * Only valid when allowEmpty is true.
   *
   * @param options Optional configuration for validation behavior (allowEmpty must be true)
   * @returns A new StringValueObject with empty string value
   *
   * @throws {BrokenRulesException} If allowEmpty is false
   */
  public static empty(
    options?: Partial<StringValueObjectOptions>,
  ): StringValueObject {
    return new StringValueObject('', { ...options, allowEmpty: true });
  }

  /**
   * Checks if the string value is empty.
   *
   * @returns True if the value is an empty string, false otherwise
   */
  isEmpty(): boolean {
    return this.getValue() === '';
  }

  /**
   * Gets the length of the string value.
   *
   * @returns The number of characters in the string
   */
  get length(): number {
    return this.getValue().length;
  }

  /**
   * Converts the string value to uppercase.
   *
   * @returns The uppercase version of the string
   */
  toUpperCase(): string {
    return this.getValue().toUpperCase();
  }

  /**
   * Converts the string value to lowercase.
   *
   * @returns The lowercase version of the string
   */
  toLowerCase(): string {
    return this.getValue().toLowerCase();
  }

  /**
   * Returns a trimmed version of the string value.
   *
   * @returns The string with leading and trailing whitespace removed
   */
  trim(): string {
    return this.getValue().trim();
  }

  /**
   * Checks if the string contains a specified substring.
   *
   * @param substring The substring to search for
   * @returns True if the substring is found, false otherwise
   */
  contains(substring: string): boolean {
    return this.getValue().includes(substring);
  }

  /**
   * Checks if the string starts with a specified prefix.
   *
   * @param prefix The prefix to check for
   * @returns True if the string starts with the prefix, false otherwise
   */
  startsWith(prefix: string): boolean {
    return this.getValue().startsWith(prefix);
  }

  /**
   * Checks if the string ends with a specified suffix.
   *
   * @param suffix The suffix to check for
   * @returns True if the string ends with the suffix, false otherwise
   */
  endsWith(suffix: string): boolean {
    return this.getValue().endsWith(suffix);
  }

  /**
   * Converts the value object to a string representation.
   * Returns the wrapped string value.
   *
   * @returns The string value
   */
  toString(): string {
    return this.getValue();
  }

  /**
   * Converts the value object to JSON representation.
   *
   * @returns The string value for JSON serialization
   */
  toJSON(): string {
    return this.getValue();
  }

  /**
   * Gets the components used for equality comparison.
   * Returns the string value as the only component.
   *
   * @returns An iterable containing the string value
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

    const options = this.effectiveOptions;

    // Add string validator with configuration
    this.validatorRules.add(
      new StringNotNullOrEmptyValidator(this, {
        allowEmpty: options.allowEmpty,
        trimWhitespace: options.trimWhitespace,
        minLength: options.minLength,
      }),
    );

    // Add max length validation only when a real bound is configured, so the
    // default case still registers exactly one validator.
    //
    // This used to push a bare `{ addRules: ... } as any` object literal into
    // the manager. ValidatorRuleManager.getBrokenRules() calls
    // `validator.validate()` on every entry, and an object literal has no
    // validate(), so reaching this branch threw
    // "TypeError: validator.validate is not a function". It went unnoticed only
    // because maxLength never reached this method at all. Anything added here
    // must be a real AbstractRuleValidator.
    //
    // Registering unconditionally (rather than only when the current value is
    // already too long) is also what makes setValue() revalidate correctly: the
    // validator re-reads the value on every validate(), so growing past the
    // bound breaks the rule and shrinking back clears it.
    if (
      options.maxLength !== undefined &&
      options.maxLength < Number.MAX_SAFE_INTEGER
    ) {
      this.validatorRules.add(
        new StringMaxLengthValidator(
          this,
          options.maxLength,
          options.trimWhitespace,
        ),
      );
    }
  }
}

/**
 * Enforces {@link StringValueObjectOptions.maxLength}.
 *
 * A real validator class rather than an inline object: ValidatorRuleManager
 * calls `validate()` on everything it holds, and it deduplicates by
 * constructor, so an anonymous shape would be both broken and impossible to
 * deduplicate.
 */
export class StringMaxLengthValidator extends AbstractRuleValidator<
  DddValueObject<string>
> {
  /**
   * @param subject The string value object to validate
   * @param maxLength Maximum number of characters allowed
   * @param trimWhitespace Whether to measure the trimmed value, matching how
   * {@link StringNotNullOrEmptyValidator} applies `trimWhitespace` to
   * `minLength`. Both bounds must measure the same string or a value can be
   * simultaneously too short and too long.
   */
  constructor(
    subject: DddValueObject<string>,
    private readonly maxLength: number,
    private readonly trimWhitespace: boolean = false,
  ) {
    super(subject);
  }

  public addRules(): void {
    const raw = this.subject.getValue();

    if (raw === null || raw === undefined) {
      return; // Null/undefined is StringNotNullOrEmptyValidator's rule to report
    }

    const value = this.trimWhitespace ? raw.trim() : raw;

    if (value.length > this.maxLength) {
      this.addBrokenRule(
        'value',
        `value must not exceed ${this.maxLength} characters (current length: ${value.length})`,
      );
    }
  }
}

/**
 * Defaults applied when no options are supplied, and the fallback used while
 * the base constructor is still running. Shared so the two cannot drift.
 */
export const DEFAULT_STRING_OPTIONS: StringValueObjectOptions = {
  allowEmpty: false,
  trimWhitespace: false,
  minLength: 0,
  maxLength: Number.MAX_SAFE_INTEGER,
};

/**
 * Configuration options for string value object validation.
 */
export interface StringValueObjectOptions {
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
   * Maximum length requirement for the string.
   * Set to Number.MAX_SAFE_INTEGER to disable maximum length validation.
   *
   * @default Number.MAX_SAFE_INTEGER
   */
  maxLength: number;
}
