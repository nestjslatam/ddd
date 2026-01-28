import { ArgumentNullException } from './exceptions/domain.exception';

/**
 * Base class for type-safe Domain Enumerations (Smart Enums).
 *
 * Provides a robust alternative to traditional TypeScript enums by allowing:
 * - Business logic and behavior in enum values
 * - Rich domain modeling
 * - Type safety with runtime checks
 * - Comparison and equality operations
 * - Serialization support
 *
 * @remarks
 * This pattern is commonly known as the "Smart Enum" or "Enumeration Class" pattern.
 * It combines the type safety of enums with the flexibility of classes, enabling
 * domain-driven design patterns where enum values can have behavior.
 *
 * **Benefits over TypeScript enums:**
 * - Can have methods and properties
 * - Can implement business logic
 * - Better for domain modeling
 * - Supports inheritance
 * - Can be extended at runtime (if needed)
 *
 * @example
 * ```typescript
 * class OrderStatus extends DddEnum {
 *   static readonly Draft = new OrderStatus(1, 'Draft');
 *   static readonly Submitted = new OrderStatus(2, 'Submitted');
 *   static readonly Approved = new OrderStatus(3, 'Approved');
 *   static readonly Shipped = new OrderStatus(4, 'Shipped');
 *   static readonly Delivered = new OrderStatus(5, 'Delivered');
 *   static readonly Cancelled = new OrderStatus(6, 'Cancelled');
 *
 *   private constructor(id: number, name: string) {
 *     super(id, name);
 *   }
 *
 *   // Add domain behavior
 *   canTransitionTo(newStatus: OrderStatus): boolean {
 *     if (this.equals(OrderStatus.Cancelled)) return false;
 *     return newStatus.id > this.id;
 *   }
 *
 *   isTerminal(): boolean {
 *     return this.equals(OrderStatus.Delivered) || this.equals(OrderStatus.Cancelled);
 *   }
 * }
 *
 * // Usage
 * const status = OrderStatus.Draft;
 * console.log(status.toString()); // "Draft"
 * console.log(status.canTransitionTo(OrderStatus.Submitted)); // true
 *
 * // Lookup by value
 * const fromDb = OrderStatus.fromValue(2); // OrderStatus.Submitted
 *
 * // Get all values
 * const allStatuses = OrderStatus.getAll<OrderStatus>();
 * ```
 *
 * @see {@link https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/enumeration-classes-over-enum-types}
 */
export abstract class DddEnum {
  /** Cache for storing all enum values per class */
  private static readonly _cache = new Map<any, DddEnum[]>();

  /**
   * Creates a new domain enumeration instance.
   *
   * @param id - Unique numeric identifier for this enum value (must be >= 0)
   * @param name - Human-readable name for this enum value (must not be empty)
   * @throws {Error} If id is negative or name is empty
   *
   * @remarks
   * Constructor should be private in derived classes to ensure only
   * predefined static instances exist (closed set of values).
   */
  protected constructor(
    public readonly id: number,
    public readonly name: string,
  ) {
    this.validateId(id);
    this.validateName(name);
  }

  /**
   * Validates the enum ID.
   */
  private validateId(id: number): void {
    if (typeof id !== 'number' || !Number.isInteger(id)) {
      throw new Error('Enum id must be an integer');
    }
    if (id < 0) {
      throw new Error('Enum id must be non-negative');
    }
  }

  /**
   * Validates the enum name.
   */
  private validateName(name: string): void {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Enum name must be a non-empty string');
    }
  }

  /**
   * Retorna el nombre de la enumeración.
   */
  public toString(): string {
    return this.name;
  }

  /**
   * Gets all defined enum values for this enumeration type.
   * Results are cached for performance.
   *
   * @template T - The specific enum type
   * @returns Array of all enum values
   *
   * @remarks
   * This method uses reflection to find all static properties that are
   * instances of the enum class. Results are cached after first call.
   *
   * @example
   * ```typescript
   * const allStatuses = OrderStatus.getAll<OrderStatus>();
   * console.log(allStatuses.length); // 6
   * ```
   */
  public static getAll<T extends DddEnum>(): T[] {
    const constructor = this as any;

    // Check cache first
    if (DddEnum._cache.has(constructor)) {
      return DddEnum._cache.get(constructor) as T[];
    }

    // Compute and cache
    const values = Object.getOwnPropertyNames(constructor)
      .map((name) => constructor[name])
      .filter((value) => value instanceof constructor) as T[];

    DddEnum._cache.set(constructor, values);
    return values;
  }

  /**
   * Determines if this enum value equals another.
   *
   * @param other - The value to compare with
   * @returns true if both enums have the same type and id
   *
   * @remarks
   * Equality is based on:
   * 1. Both values are DddEnum instances
   * 2. Both have the same prototype (same enum class)
   * 3. Both have the same id
   *
   * @example
   * ```typescript
   * OrderStatus.Draft.equals(OrderStatus.Draft); // true
   * OrderStatus.Draft.equals(OrderStatus.Submitted); // false
   * ```
   */
  public equals(other: unknown): boolean {
    if (!(other instanceof DddEnum)) {
      return false;
    }

    const typeMatches =
      Object.getPrototypeOf(this) === Object.getPrototypeOf(other);
    const valueMatches = this.id === other.id;

    return typeMatches && valueMatches;
  }

  /**
   * Calculates the absolute difference between two enum values.
   *
   * @param firstValue - First enum value
   * @param secondValue - Second enum value
   * @returns Absolute difference between the ids
   * @throws {ArgumentNullException} If either value is null/undefined
   *
   * @remarks
   * Useful for determining "distance" between enum values,
   * such as workflow stages or priority levels.
   *
   * @example
   * ```typescript
   * const diff = OrderStatus.absoluteDifference(
   *   OrderStatus.Draft,
   *   OrderStatus.Shipped
   * );
   * console.log(diff); // 3
   * ```
   */
  public static absoluteDifference(
    firstValue: DddEnum,
    secondValue: DddEnum,
  ): number {
    if (!firstValue) {
      throw new ArgumentNullException('firstValue');
    }
    if (!secondValue) {
      throw new ArgumentNullException('secondValue');
    }
    return Math.abs(firstValue.id - secondValue.id);
  }

  /**
   * Retrieves an enum value by its numeric ID.
   *
   * @template T - The specific enum type
   * @param value - The numeric ID to look up
   * @returns The matching enum value, or undefined if not found
   *
   * @example
   * ```typescript
   * const status = OrderStatus.fromValue<OrderStatus>(2);
   * if (status) {
   *   console.log(status.name); // "Submitted"
   * }
   * ```
   */
  public static fromValue<T extends DddEnum>(value: number): T | undefined {
    if (typeof value !== 'number') {
      return undefined;
    }
    const allItems = this.getAll<T>();
    return allItems.find((item) => item.id === value);
  }

  /**
   * Retrieves an enum value by its name (case-sensitive).
   *
   * @template T - The specific enum type
   * @param name - The name to look up
   * @returns The matching enum value, or undefined if not found
   *
   * @example
   * ```typescript
   * const status = OrderStatus.fromName<OrderStatus>('Draft');
   * ```
   */
  public static fromName<T extends DddEnum>(name: string): T | undefined {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return undefined;
    }
    const allItems = this.getAll<T>();
    return allItems.find((item) => item.name === name);
  }

  /**
   * Retrieves an enum value by its name (case-insensitive).
   *
   * @template T - The specific enum type
   * @param name - The name to look up (case-insensitive)
   * @returns The matching enum value, or undefined if not found
   *
   * @example
   * ```typescript
   * const status = OrderStatus.fromNameIgnoreCase<OrderStatus>('draft');
   * // Returns OrderStatus.Draft
   * ```
   */
  public static fromNameIgnoreCase<T extends DddEnum>(
    name: string,
  ): T | undefined {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return undefined;
    }
    const allItems = this.getAll<T>();
    const lowerName = name.toLowerCase();
    return allItems.find((item) => item.name.toLowerCase() === lowerName);
  }

  /**
   * @deprecated Use fromName instead. This alias exists for backward compatibility.
   */
  public static fromDisplayName<T extends DddEnum>(
    displayName: string,
  ): T | undefined {
    return this.fromName<T>(displayName);
  }

  /**
   * Compares this enum value with another for sorting.
   *
   * @param other - The enum value to compare with
   * @returns Negative if this < other, 0 if equal, positive if this > other
   * @throws {ArgumentNullException} If other is null/undefined
   *
   * @remarks
   * Comparison is based on the numeric id values.
   * Useful for sorting enum values or determining order.
   *
   * @example
   * ```typescript
   * const statuses = [OrderStatus.Shipped, OrderStatus.Draft, OrderStatus.Approved];
   * statuses.sort((a, b) => a.compareTo(b));
   * // Result: [Draft, Approved, Shipped]
   * ```
   */
  public compareTo(other: DddEnum): number {
    if (!other) {
      throw new ArgumentNullException('other');
    }
    return this.id - other.id;
  }

  /**
   * Checks if this enum value is less than another.
   */
  public isLessThan(other: DddEnum): boolean {
    return this.compareTo(other) < 0;
  }

  /**
   * Checks if this enum value is less than or equal to another.
   */
  public isLessThanOrEqual(other: DddEnum): boolean {
    return this.compareTo(other) <= 0;
  }

  /**
   * Checks if this enum value is greater than another.
   */
  public isGreaterThan(other: DddEnum): boolean {
    return this.compareTo(other) > 0;
  }

  /**
   * Checks if this enum value is greater than or equal to another.
   */
  public isGreaterThanOrEqual(other: DddEnum): boolean {
    return this.compareTo(other) >= 0;
  }

  /**
   * Checks if a value is defined in the enumeration.
   *
   * @param value - The numeric ID to check
   * @returns true if the value exists in the enum
   *
   * @example
   * ```typescript
   * OrderStatus.isDefined(1); // true
   * OrderStatus.isDefined(999); // false
   * ```
   */
  public static isDefined(value: number): boolean {
    return this.fromValue(value) !== undefined;
  }

  /**
   * Gets the minimum enum value (lowest id).
   *
   * @template T - The specific enum type
   * @returns The enum value with the lowest id, or undefined if empty
   */
  public static getMinValue<T extends DddEnum>(): T | undefined {
    const allItems = this.getAll<T>();
    if (allItems.length === 0) return undefined;
    return allItems.reduce((min, item) => (item.id < min.id ? item : min));
  }

  /**
   * Gets the maximum enum value (highest id).
   *
   * @template T - The specific enum type
   * @returns The enum value with the highest id, or undefined if empty
   */
  public static getMaxValue<T extends DddEnum>(): T | undefined {
    const allItems = this.getAll<T>();
    if (allItems.length === 0) return undefined;
    return allItems.reduce((max, item) => (item.id > max.id ? item : max));
  }

  /**
   * Checks if this enum value is within a range (inclusive).
   *
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns true if this value is between min and max (inclusive)
   */
  public isBetween(min: DddEnum, max: DddEnum): boolean {
    return this.isGreaterThanOrEqual(min) && this.isLessThanOrEqual(max);
  }

  /**
   * Static equality comparison (null-safe).
   *
   * @param left - First enum value (can be null/undefined)
   * @param right - Second enum value (can be null/undefined)
   * @returns true if both are null/undefined or both are equal
   *
   * @example
   * ```typescript
   * DddEnum.areEqual(OrderStatus.Draft, OrderStatus.Draft); // true
   * DddEnum.areEqual(null, null); // true
   * DddEnum.areEqual(OrderStatus.Draft, null); // false
   * ```
   */
  public static areEqual(
    left: DddEnum | null | undefined,
    right: DddEnum | null | undefined,
  ): boolean {
    if (left === null || left === undefined) {
      return right === null || right === undefined;
    }
    return left.equals(right);
  }

  /**
   * Static inequality comparison (null-safe).
   *
   * @param left - First enum value (can be null/undefined)
   * @param right - Second enum value (can be null/undefined)
   * @returns true if values are not equal
   */
  public static areNotEqual(
    left: DddEnum | null | undefined,
    right: DddEnum | null | undefined,
  ): boolean {
    return !this.areEqual(left, right);
  }
}
