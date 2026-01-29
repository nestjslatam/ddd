import { BrokenRulesManager } from './broken-rules.manager';
import { AbstractNotifyPropertyChanged } from './core/business-rules/impl/property-change';
import { AbstractRuleValidator } from './core/validator-rules';
import { ArgumentNullException } from './exceptions/domain.exception';
import { TrackingStateManager } from './tracking-state-manager';
import { ValidatorRuleManager } from './validator-rule.manager';

/**
 * Base class for Value Objects in Domain-Driven Design.
 * Value Objects are compared by their properties, not by identity (ID).
 *
 * @template TValue - The type of the internal value
 *
 * @remarks
 * Value Objects are immutable domain concepts that describe characteristics or attributes.
 * They have no conceptual identity and are defined entirely by their attributes.
 *
 * Key characteristics:
 * - Equality based on structural comparison of all properties
 * - Should be immutable (use setValue cautiously)
 * - No identity (no ID)
 * - Side-effect free behavior
 *
 * @example
 * ```typescript
 * // Defining a value object for email
 * class Email extends DddValueObject<string> {
 *   private constructor(value: string) {
 *     super(value);
 *   }
 *
 *   override addValidators(): void {
 *     super.addValidators();
 *     this.validatorRules.add(new EmailFormatValidator(this));
 *   }
 *
 *   protected getEqualityComponents(): Iterable<any> {
 *     return [this.getValue()];
 *   }
 *
 *   public static create(value: string): Email {
 *     return new Email(value);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Defining a complex value object with multiple properties
 * class Address extends DddValueObject<AddressValue> {
 *   private constructor(value: AddressValue) {
 *     super(value);
 *   }
 *
 *   protected getEqualityComponents(): Iterable<any> {
 *     const val = this.getValue();
 *     return [val.street, val.city, val.postalCode, val.country];
 *   }
 *
 *   public static create(street: string, city: string, postalCode: string, country: string): Address {
 *     return new Address({ street, city, postalCode, country });
 *   }
 * }
 * ```
 */
export abstract class DddValueObject<
  TValue,
> extends AbstractNotifyPropertyChanged {
  /**
   * Manages change tracking state for the value object.
   * Tracks whether the value object is new, modified, or deleted.
   */
  public readonly trackingState: TrackingStateManager;

  /**
   * Manages validation rules for the value object.
   * Add validators in the {@link addValidators} method.
   */
  public readonly validatorRules: ValidatorRuleManager<
    AbstractRuleValidator<DddValueObject<TValue>>
  >;

  /**
   * Manages broken business rules (validation errors).
   * Populated automatically when validation fails.
   */
  public readonly brokenRules: BrokenRulesManager;

  /**
   * Indicates if the value object is valid (no broken business rules).
   * @returns true if no validation errors exist, false otherwise
   *
   * @example
   * ```typescript
   * const email = Email.create('test@example.com');
   * if (!email.isValid) {
   *   console.error('Validation errors:', email.brokenRules.getBrokenRules());
   * }
   * ```
   */
  public get isValid(): boolean {
    return this.brokenRules.getBrokenRules().length === 0;
  }

  /**
   * Initializes a new instance of a value object.
   *
   * @param value The internal value of the value object
   * @throws {ArgumentNullException} If value is null or undefined
   *
   * @remarks
   * The constructor:
   * 1. Validates the value is not null/undefined
   * 2. Initializes managers (broken rules, validators, tracking state)
   * 3. Registers the internal value for change detection
   * 4. Marks the value object as new
   * 5. Runs initial validation
   *
   * @example
   * ```typescript
   * class ProductName extends DddValueObject<string> {
   *   private constructor(value: string) {
   *     super(value); // Calls this base constructor
   *   }
   * }
   * ```
   */
  protected constructor(value: TValue) {
    super();

    if (value === null || value === undefined) {
      throw new ArgumentNullException('value');
    }

    // Initialize managers (equivalent to IoC container setup in C#)
    this.brokenRules = new BrokenRulesManager();
    this.validatorRules = new ValidatorRuleManager<
      AbstractRuleValidator<DddValueObject<TValue>>
    >();
    this.trackingState = new TrackingStateManager();

    // Register internal property for change observation
    // Map typeof to constructors for type validation
    const valueType = this.getTypeConstructor(typeof value, value);
    this.registerProperty(
      'internalValue',
      valueType,
      value,
      this.valuePropertyChanged.bind(this),
    );

    this.trackingState.markAsNew();

    this.addValidators();
    this.validate();
  }

  /**
   * Handler triggered when the internal value changes.
   * Marks the value object as dirty and re-runs validation.
   *
   * @remarks
   * This is part of the property change notification pattern.
   * Called automatically when setValue() is invoked.
   */
  private valuePropertyChanged(): void {
    this.trackingState.markAsDirty();
    this.validate();
  }

  /**
   * Changes the internal value and triggers validation.
   *
   * @param value The new value to set
   * @throws {ArgumentNullException} If value is null or undefined
   *
   * @remarks
   * ⚠️ **Immutability Concern**: Value objects should typically be immutable.
   * Consider creating a new instance instead of mutating the existing one.
   * This method exists for specific scenarios where mutation is necessary,
   * but violates the pure value object pattern.
   *
   * @example
   * ```typescript
   * // Discouraged - mutates existing value object
   * const email = Email.create('old@example.com');
   * email.setValue('new@example.com');
   *
   * // Preferred - create new instance
   * const oldEmail = Email.create('old@example.com');
   * const newEmail = Email.create('new@example.com');
   * ```
   */
  public setValue(value: TValue): void {
    if (value === null || value === undefined) {
      throw new ArgumentNullException('value');
    }
    this.setValuePropertyChanged(value, 'internalValue');
  }

  /**
   * Gets the current internal value.
   *
   * @returns The internal value of type TValue
   *
   * @example
   * ```typescript
   * const email = Email.create('test@example.com');
   * console.log(email.getValue()); // 'test@example.com'
   * ```
   */
  public getValue(): TValue {
    return this.getValuePropertyChanged('internalValue') as TValue;
  }

  /**
   * Allows derived classes to add specific validators.
   * Override this method to add custom validation rules.
   *
   * @remarks
   * This is a Template Method pattern implementation.
   * The base implementation does nothing - subclasses provide specific validators.
   *
   * @example
   * ```typescript
   * class Email extends DddValueObject<string> {
   *   override addValidators(): void {
   *     super.addValidators();
   *     this.validatorRules.add(new EmailFormatValidator(this));
   *     this.validatorRules.add(new EmailLengthValidator(this));
   *   }
   * }
   * ```
   */
  public addValidators(): void {
    // To be implemented in derived classes (e.g., email format validation, video resolution validation)
  }

  /**
   * Executes all registered validators and updates broken rules collection.
   * Called automatically after construction and value changes.
   *
   * @remarks
   * This method:
   * 1. Clears previous validation errors
   * 2. Executes all validators
   * 3. Collects broken rules from all validators
   * 4. Updates the brokenRules manager
   */
  private validate(): void {
    // Clear previously stored rules
    this.brokenRules.clear();

    // Get all broken rules from validator manager
    const brokenRulesArray = this.validatorRules.getBrokenRules();

    // Add all broken rules to the broken rules manager
    if (brokenRulesArray && brokenRulesArray.length > 0) {
      this.brokenRules.addRange(brokenRulesArray);
    }
  }

  /**
   * Abstract method that derived classes must implement to list equality components.
   * These components define what makes two value objects equal.
   *
   * @returns Iterable of all components used for equality comparison
   *
   * @remarks
   * Include all properties that define the value object's identity.
   * Order matters - components are compared in sequence.
   *
   * @example
   * ```typescript
   * // Simple value object with single property
   * class Email extends DddValueObject<string> {
   *   protected getEqualityComponents(): Iterable<any> {
   *     return [this.getValue()];
   *   }
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Complex value object with multiple properties
   * class Address extends DddValueObject<AddressValue> {
   *   protected getEqualityComponents(): Iterable<any> {
   *     const val = this.getValue();
   *     return [val.street, val.city, val.postalCode, val.country];
   *   }
   * }
   * ```
   */
  protected abstract getEqualityComponents(): Iterable<any>;

  /**
   * Maps a primitive type (string literal from typeof) to its corresponding constructor.
   *
   * @param typeString The result of typeof operation
   * @param value The actual value to extract constructor from
   * @returns The constructor function for the type
   *
   * @remarks
   * This helper supports the property change notification system.
   * It maps JavaScript primitive types to their constructor functions.
   * For objects, it attempts to extract the constructor from the value itself.
   */
  private getTypeConstructor(typeString: string, value: any): any {
    const typeMap: Record<string, any> = {
      string: String,
      number: Number,
      boolean: Boolean,
      symbol: Symbol,
      bigint: BigInt,
    };

    // If it's a known primitive type, return its constructor
    if (typeString in typeMap) {
      return typeMap[typeString];
    }

    // If the value has a constructor, use it
    if (value?.constructor) {
      return value.constructor;
    }

    // By default, return the type as-is (it might be a class)
    return typeString;
  }

  /**
   * Compares this value object with another for structural equality.
   * Two value objects are equal if all their equality components match.
   *
   * @param obj The object to compare with
   * @returns true if objects are structurally equal, false otherwise
   *
   * @remarks
   * Equality is based on:
   * 1. Type compatibility (same prototype)
   * 2. All equality components matching (===)
   * 3. Same number of components
   *
   * @example
   * ```typescript
   * const email1 = Email.create('test@example.com');
   * const email2 = Email.create('test@example.com');
   * const email3 = Email.create('other@example.com');
   *
   * console.log(email1.equals(email2)); // true
   * console.log(email1.equals(email3)); // false
   * ```
   */
  public equals(obj: unknown): boolean {
    if (
      obj === null ||
      obj === undefined ||
      Object.getPrototypeOf(this) !== Object.getPrototypeOf(obj)
    ) {
      return false;
    }

    const other = obj as DddValueObject<TValue>;
    const thisComponents = Array.from(this.getEqualityComponents());
    const otherComponents = Array.from(other.getEqualityComponents());

    if (thisComponents.length !== otherComponents.length) return false;

    return thisComponents.every((val, index) => val === otherComponents[index]);
  }

  /**
   * Generates a hash code based on equality components.
   *
   * @returns A numeric hash code
   *
   * @remarks
   * ⚠️ **Simplified Implementation**: This is a basic hash function suitable for
   * basic scenarios but not cryptographically secure or collision-resistant.
   * Consider using a proper hashing library for production use cases requiring
   * strong hash functions.
   *
   * @example
   * ```typescript
   * const email = Email.create('test@example.com');
   * const hash = email.getHashCode();
   * console.log(`Hash: ${hash}`);
   * ```
   */
  public getHashCode(): number {
    const components = Array.from(this.getEqualityComponents());
    return components.reduce((hash, item) => {
      const itemHash = item ? JSON.stringify(item).length : 0; // Simplified for TypeScript
      return Math.trunc((hash << 5) - hash + itemHash);
    }, 0);
  }

  /**
   * Creates a shallow copy of the value object.
   *
   * @returns A new instance with the same properties
   *
   * @remarks
   * ⚠️ **Shallow Copy Limitation**: This method creates a shallow copy using Object.assign.
   * Nested objects and arrays are copied by reference, not deep-cloned.
   * For value objects with complex nested structures, consider implementing
   * a proper deep clone mechanism.
   *
   * @example
   * ```typescript
   * const original = Email.create('test@example.com');
   * const copy = original.getCopy();
   * console.log(original.equals(copy)); // true
   * console.log(original === copy); // false (different instances)
   * ```
   */
  public getCopy(): DddValueObject<TValue> {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }

  /**
   * Alias for {@link getCopy}. Creates a shallow copy of the value object.
   *
   * @returns A new instance with the same properties
   *
   * @remarks
   * This method exists for compatibility with general cloning patterns.
   * See {@link getCopy} for detailed behavior and limitations.
   */
  public clone(): object {
    return this.getCopy();
  }
}
