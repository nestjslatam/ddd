import { BrokenRule } from './core/business-rules';
import { ArgumentNullException } from './exceptions/domain.exception';

/**
 * Interface for managing broken business rules.
 * Defines the contract for accessing validation errors.
 */
export interface IBrokenRulesManager {
  /**
   * Gets all broken rules as a readonly array.
   * @returns Array of broken rules
   */
  getBrokenRules(): ReadonlyArray<BrokenRule>;
}

/**
 * Manages a collection of broken business rules (validation errors).
 *
 * This class provides functionality to:
 * - Add and remove broken rules with deduplication
 * - Clear all rules
 * - Format rules as human-readable strings
 * - Extract rules from nested value objects
 *
 * @remarks
 * Rules are deduplicated based on case-insensitive comparison of property names and messages.
 * The collection is immutable from outside the class to prevent unintended modifications.
 *
 * @example
 * ```typescript
 * const manager = new BrokenRulesManager();
 * manager.add(new BrokenRule('price', 'Price must be positive'));
 * manager.add(new BrokenRule('name', 'Name is required'));
 *
 * if (manager.getBrokenRules().length > 0) {
 *   console.log(manager.getBrokenRulesAsString());
 * }
 * ```
 */
export class BrokenRulesManager implements IBrokenRulesManager {
  /** Internal collection of broken rules */
  private _brokenRules: BrokenRule[] = [];

  /** Property name to look for when extracting nested broken rules */
  private static readonly BROKEN_RULES_PROPERTY_NAME = 'brokenRules' as const;

  /**
   * Adds a broken rule to the collection if it doesn't already exist.
   *
   * @param brokenRule - The broken rule to add
   * @throws {ArgumentNullException} If brokenRule is null or undefined
   *
   * @remarks
   * Deduplication is performed using case-insensitive comparison of both
   * property name and message. This prevents duplicate error messages for
   * the same validation failure.
   *
   * @example
   * ```typescript
   * manager.add(new BrokenRule('email', 'Invalid email format'));
   * manager.add(new BrokenRule('EMAIL', 'Invalid email format')); // Won't be added (duplicate)
   * ```
   */
  public add(brokenRule: BrokenRule): void {
    this.validateNotNull(brokenRule, 'brokenRule');

    if (!this.exists(brokenRule)) {
      this._brokenRules.push(brokenRule);
    }
  }

  /**
   * Adds multiple broken rules to the collection.
   *
   * @param brokenRules - Array of broken rules to add
   * @throws {ArgumentNullException} If brokenRules is null or undefined
   *
   * @remarks
   * Each rule is added individually, so deduplication logic applies to each one.
   *
   * @example
   * ```typescript
   * const rules = [
   *   new BrokenRule('name', 'Name is required'),
   *   new BrokenRule('age', 'Age must be positive')
   * ];
   * manager.addRange(rules);
   * ```
   */
  public addRange(brokenRules: ReadonlyArray<BrokenRule>): void {
    this.validateNotNull(brokenRules, 'brokenRules');
    brokenRules.forEach((rule) => this.add(rule));
  }

  /**
   * Removes a broken rule from the collection.
   *
   * @param brokenRule - The broken rule to remove
   * @throws {ArgumentNullException} If brokenRule is null or undefined
   *
   * @remarks
   * Removal uses the same case-insensitive comparison as add() for consistency.
   * If the rule doesn't exist, the method does nothing.
   *
   * @example
   * ```typescript
   * const rule = new BrokenRule('price', 'Invalid price');
   * manager.add(rule);
   * manager.remove(rule);
   * ```
   */
  public remove(brokenRule: BrokenRule): void {
    this.validateNotNull(brokenRule, 'brokenRule');

    const index = this._brokenRules.findIndex((rule) =>
      this.isSameRule(rule, brokenRule),
    );

    if (index !== -1) {
      this._brokenRules.splice(index, 1);
    }
  }

  /**
   * Removes all broken rules from the collection.
   *
   * @remarks
   * Typically called before re-validating an aggregate to clear previous validation errors.
   *
   * @example
   * ```typescript
   * manager.clear();
   * // Re-validate and add new rules
   * aggregate.validate();
   * ```
   */
  public clear(): void {
    this._brokenRules = [];
  }

  /**
   * Gets all broken rules as a readonly array.
   *
   * @returns Frozen array of broken rules (immutable)
   *
   * @remarks
   * Returns a frozen copy to prevent external modifications.
   * The array is recreated on each call to ensure immutability.
   */
  public getBrokenRules(): ReadonlyArray<BrokenRule> {
    return Object.freeze([...this._brokenRules]);
  }

  /**
   * Checks if there are any broken rules.
   *
   * @returns true if there are no broken rules, false otherwise
   *
   * @example
   * ```typescript
   * if (manager.hasErrors()) {
   *   throw new ValidationException(manager.getBrokenRules());
   * }
   * ```
   */
  public hasErrors(): boolean {
    return this._brokenRules.length > 0;
  }

  /**
   * Formats all broken rules as a human-readable string.
   *
   * @returns String with each rule on a new line, or empty string if no rules
   *
   * @remarks
   * Useful for logging or displaying validation errors to users.
   * Format: "Property: {property}, Message: {message}"
   *
   * @example
   * ```typescript
   * console.error('Validation failed:\n' + manager.getBrokenRulesAsString());
   * // Output:
   * // Validation failed:
   * // Property: price, Message: Price must be positive
   * // Property: name, Message: Name is required
   * ```
   */
  public getBrokenRulesAsString(): string {
    if (this._brokenRules.length === 0) {
      return '';
    }
    return this._brokenRules
      .map((rule) => `Property: ${rule.property}, Message: ${rule.message}`)
      .join('\n');
  }

  /**
   * Extracts broken rules from properties of an instance that contain nested BrokenRulesManager.
   *
   * @param instance - The object instance to extract rules from
   * @param properties - Array of property keys to check
   * @returns Frozen array of all broken rules found in nested properties
   * @throws {ArgumentNullException} If instance or properties is null/undefined
   *
   * @remarks
   * This method is useful for aggregates containing value objects that have their own
   * validation rules. It recursively collects all broken rules from nested objects.
   *
   * Looks for a 'brokenRules' property that implements IBrokenRulesManager interface.
   *
   * @example
   * ```typescript
   * class Order {
   *   shippingAddress: Address; // Address has its own brokenRules
   *   billingAddress: Address;
   * }
   *
   * const order = new Order();
   * const nestedRules = BrokenRulesManager.getPropertiesBrokenRules(
   *   order,
   *   ['shippingAddress', 'billingAddress']
   * );
   * ```
   */
  public static getPropertiesBrokenRules<T extends object>(
    instance: T,
    properties: Array<keyof T>,
  ): ReadonlyArray<BrokenRule> {
    if (instance === null || instance === undefined) {
      throw new ArgumentNullException('instance');
    }

    if (!properties) {
      throw new ArgumentNullException('properties');
    }

    const result: BrokenRule[] = [];

    for (const key of properties) {
      const valueObject = instance[key];

      if (valueObject === null || valueObject === undefined) {
        continue;
      }

      // Check if the property has a brokenRules manager
      const brokenRulesManager = this.extractBrokenRulesManager(valueObject);

      if (brokenRulesManager) {
        const brokenRules = brokenRulesManager.getBrokenRules();
        if (brokenRules.length > 0) {
          result.push(...brokenRules);
        }
      }
    }

    return Object.freeze(result);
  }

  /**
   * Private helper to validate that a value is not null or undefined.
   *
   * @param value - The value to check
   * @param parameterName - Name of the parameter for the error message
   * @throws {ArgumentNullException} If value is null or undefined
   */
  private validateNotNull(value: any, parameterName: string): void {
    if (value === null || value === undefined) {
      throw new ArgumentNullException(parameterName);
    }
  }

  /**
   * Private helper to check if a rule already exists in the collection.
   *
   * @param brokenRule - The rule to check for
   * @returns true if the rule exists (case-insensitive), false otherwise
   */
  private exists(brokenRule: BrokenRule): boolean {
    return this._brokenRules.some((rule) => this.isSameRule(rule, brokenRule));
  }

  /**
   * Private helper to compare two rules for equality.
   * Uses case-insensitive comparison of property and message.
   *
   * @param rule1 - First rule
   * @param rule2 - Second rule
   * @returns true if rules are considered the same
   */
  private isSameRule(rule1: BrokenRule, rule2: BrokenRule): boolean {
    return (
      rule1.property.toLowerCase() === rule2.property.toLowerCase() &&
      rule1.message.toLowerCase() === rule2.message.toLowerCase()
    );
  }

  /**
   * Private helper to extract BrokenRulesManager from a value object.
   *
   * @param valueObject - The object to extract from
   * @returns The broken rules manager if found, null otherwise
   */
  private static extractBrokenRulesManager(
    valueObject: unknown,
  ): IBrokenRulesManager | null {
    if (
      typeof valueObject === 'object' &&
      valueObject !== null &&
      BrokenRulesManager.BROKEN_RULES_PROPERTY_NAME in valueObject
    ) {
      const manager = (valueObject as Record<string, unknown>)[
        BrokenRulesManager.BROKEN_RULES_PROPERTY_NAME
      ];

      if (
        manager &&
        typeof manager === 'object' &&
        'getBrokenRules' in manager &&
        typeof (manager as any).getBrokenRules === 'function'
      ) {
        return manager as IBrokenRulesManager;
      }
    }

    return null;
  }
}
