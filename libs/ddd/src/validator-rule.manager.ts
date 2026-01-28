import { BrokenRule } from './core/business-rules';
import { ClassType, IRuleValidator } from './core/validator-rules';
import { ArgumentNullException } from './exceptions/domain.exception';

/**
 * Manages a collection of validation rules for a specific entity type.
 * Ensures validator uniqueness and provides efficient broken rule detection.
 *
 * @template TValidator - The type of validator that must implement {@link IRuleValidator}
 *
 * @remarks
 * This class follows the Composite pattern to manage multiple validators.
 * Validators are deduplicated by their constructor type to prevent duplicate validations.
 * All broken rules from validators are consolidated and deduplicated before return.
 *
 * @example
 * ```typescript
 * // In an aggregate root or value object
 * class Product extends DddAggregateRoot<ProductProps, ProductId, ProductState> {
 *   protected addValidators(manager: ValidatorRuleManager<AbstractRuleValidator<Product>>): void {
 *     manager.add(new ProductNameValidator(this));
 *     manager.add(new ProductPriceValidator(this));
 *     manager.add(new ProductStockValidator(this));
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Creating and using a validator manager
 * const manager = new ValidatorRuleManager<AbstractRuleValidator<Order>>();
 *
 * // Add validators
 * manager.add(new OrderTotalValidator(order));
 * manager.add(new OrderItemsValidator(order));
 *
 * // Check for validation errors
 * const brokenRules = manager.getBrokenRules();
 * if (brokenRules.length > 0) {
 *   throw new ValidationException(brokenRules);
 * }
 * ```
 */
export class ValidatorRuleManager<TValidator extends IRuleValidator> {
  /**
   * Internal collection of validators.
   * Validators are unique by constructor type.
   */
  private readonly _validators: TValidator[] = [];

  /**
   * Adds a validator to the collection if one of the same type doesn't already exist.
   * Validators are deduplicated by their constructor to prevent duplicate validations.
   *
   * @param rule The validator to add
   * @throws {ArgumentNullException} If rule is null or undefined
   *
   * @example
   * ```typescript
   * const manager = new ValidatorRuleManager<AbstractRuleValidator<Product>>();
   * manager.add(new ProductNameValidator(product));
   * manager.add(new ProductPriceValidator(product));
   *
   * // Adding same type again - will be ignored
   * manager.add(new ProductNameValidator(product)); // No-op, already exists
   * ```
   */
  public add(rule: TValidator): void {
    if (!rule) {
      throw new ArgumentNullException('rule');
    }

    // Check if a validator of the same class type already exists
    if (!this.hasValidatorOfType(rule.constructor as ClassType)) {
      this._validators.push(rule);
    }
  }

  /**
   * Adds multiple validators to the collection at once.
   * Each validator is processed through {@link add} to ensure uniqueness.
   *
   * @param rules Array of validators to add
   * @throws {ArgumentNullException} If rules array is null or undefined
   *
   * @example
   * ```typescript
   * const validators = [
   *   new ProductNameValidator(product),
   *   new ProductPriceValidator(product),
   *   new ProductStockValidator(product)
   * ];
   *
   * manager.addRange(validators);
   * ```
   */
  public addRange(rules: TValidator[]): void {
    if (!rules) {
      throw new ArgumentNullException('rules');
    }

    if (rules.length === 0) {
      return; // Early return for empty array
    }

    rules.forEach((rule) => this.add(rule));
  }

  /**
   * Removes a specific validator from the collection.
   *
   * @param rule The validator instance to remove
   * @throws {ArgumentNullException} If rule is null or undefined
   *
   * @example
   * ```typescript
   * const validator = new ProductNameValidator(product);
   * manager.add(validator);
   * // ... later
   * manager.remove(validator);
   * ```
   */
  public remove(rule: TValidator): void {
    if (!rule) {
      throw new ArgumentNullException('rule');
    }

    const index = this._validators.indexOf(rule);
    if (index !== -1) {
      this._validators.splice(index, 1);
    }
  }

  /**
   * Removes all validators from the collection.
   *
   * @example
   * ```typescript
   * manager.clear();
   * console.log(manager.isEmpty()); // true
   * ```
   */
  public clear(): void {
    this._validators.length = 0;
  }

  /**
   * Gets a read-only collection of all validators in the manager.
   * Returns a defensive copy to prevent external modifications.
   *
   * @returns Frozen array of all validators
   *
   * @example
   * ```typescript
   * const validators = manager.getValidators();
   * console.log(`Total validators: ${validators.length}`);
   * validators.forEach(v => console.log(v.constructor.name));
   * ```
   */
  public getValidators(): ReadonlyArray<TValidator> {
    return Object.freeze([...this._validators]);
  }

  /**
   * Executes all validators and consolidates broken rules without duplicates.
   * Deduplication is performed using normalized property and message comparison.
   *
   * @returns Frozen array of all unique broken rules from all validators
   *
   * @remarks
   * Broken rules are deduplicated by comparing normalized (trimmed, uppercase)
   * property names and messages. This prevents duplicate error messages for the same issue.
   *
   * @example
   * ```typescript
   * const brokenRules = manager.getBrokenRules();
   * if (brokenRules.length > 0) {
   *   console.log('Validation errors:');
   *   brokenRules.forEach(rule => {
   *     console.log(`  ${rule.property}: ${rule.message}`);
   *   });
   *   throw new ValidationException(brokenRules);
   * }
   * ```
   */
  public getBrokenRules(): ReadonlyArray<BrokenRule> {
    const result: BrokenRule[] = [];
    const seen = new Set<string>();

    for (const validator of this._validators) {
      const brokenRules = validator.validate();

      if (brokenRules && brokenRules.length > 0) {
        for (const brokenRule of brokenRules) {
          const key = this.getBrokenRuleKey(brokenRule);

          if (!seen.has(key)) {
            seen.add(key);
            result.push(brokenRule);
          }
        }
      }
    }

    return Object.freeze(result);
  }

  /**
   * Checks if the manager contains any validators.
   *
   * @returns true if no validators exist, false otherwise
   *
   * @example
   * ```typescript
   * if (manager.isEmpty()) {
   *   console.log('No validators configured');
   * }
   * ```
   */
  public isEmpty(): boolean {
    return this._validators.length === 0;
  }

  /**
   * Gets the total count of validators in the manager.
   *
   * @returns Number of validators
   *
   * @example
   * ```typescript
   * console.log(`Configured validators: ${manager.count()}`);
   * ```
   */
  public count(): number {
    return this._validators.length;
  }

  /**
   * Checks if a validator of the specified type exists in the collection.
   *
   * @param validatorType The constructor/class of the validator to check
   * @returns true if validator of this type exists, false otherwise
   *
   * @example
   * ```typescript
   * if (manager.has(ProductNameValidator)) {
   *   console.log('Name validation is configured');
   * }
   * ```
   */
  public has(validatorType: ClassType<TValidator>): boolean {
    return this.hasValidatorOfType(validatorType);
  }

  /**
   * Finds a validator by its type.
   *
   * @param validatorType The constructor/class of the validator to find
   * @returns The validator instance if found, undefined otherwise
   *
   * @example
   * ```typescript
   * const nameValidator = manager.findByType(ProductNameValidator);
   * if (nameValidator) {
   *   console.log('Found name validator');
   * }
   * ```
   */
  public findByType(
    validatorType: ClassType<TValidator>,
  ): TValidator | undefined {
    return this._validators.find((v) => v.constructor === validatorType);
  }

  /**
   * Private helper to check if a validator of the given type exists.
   * Extracted for DRY principle and performance optimization.
   *
   * @param validatorType The validator constructor to check
   * @returns true if exists, false otherwise
   */
  private hasValidatorOfType(validatorType: ClassType): boolean {
    return this._validators.some((v) => v.constructor === validatorType);
  }

  /**
   * Generates a normalized key for broken rule deduplication.
   * Uses trimmed and uppercase property name and message for case-insensitive comparison.
   *
   * @param brokenRule The broken rule to generate key for
   * @returns Normalized string key for deduplication
   */
  private getBrokenRuleKey(brokenRule: BrokenRule): string {
    const property = brokenRule.property.trim().toUpperCase();
    const message = brokenRule.message.trim().toUpperCase();
    return `${property}:${message}`;
  }
}
