import { AggregateIdentity } from './aggregate-identity';

/**
 * Provides equality comparison logic for DDD aggregates.
 * Handles identity-based equality and type checking.
 *
 * @remarks
 * This class encapsulates the equality logic for aggregates,
 * implementing DDD principles where equality is based on identity,
 * not property values.
 *
 * @example
 * ```typescript
 * const equality = new AggregateEquality(identity1, MyAggregate);
 * const isEqual = equality.equals(otherAggregate); // Compare aggregates
 * ```
 */
export class AggregateEquality<T extends { identity: AggregateIdentity }> {
  private readonly identity: AggregateIdentity;
  private readonly aggregateType: new (...args: any[]) => T;

  /**
   * Creates a new equality comparator.
   *
   * @param identity The identity of the aggregate
   * @param aggregateType The constructor function of the aggregate type
   */
  constructor(
    identity: AggregateIdentity,
    aggregateType: new (...args: any[]) => T,
  ) {
    this.identity = identity;
    this.aggregateType = aggregateType;
  }

  /**
   * Compares the aggregate with another object for equality.
   *
   * Equality is determined by:
   * 1. Both objects are non-null
   * 2. Both are instances of the same aggregate type
   * 3. Both have the same identity (ID)
   *
   * @param obj The object to compare with
   * @returns true if objects are equal, false otherwise
   */
  public equals(obj: unknown): boolean {
    if (obj === null || obj === undefined) {
      return false;
    }

    // Not an instance of the expected type
    if (!(obj instanceof this.aggregateType)) {
      return false;
    }

    // Reference equality check removed as 'this' is AggregateEquality, not the aggregate itself

    // Compare identities
    const typedObj = obj as T;
    return this.identity.equals(typedObj.identity);
  }

  /**
   * Static method for null-safe equality comparison.
   *
   * @param left First aggregate (can be null/undefined)
   * @param right Second aggregate (can be null/undefined)
   * @returns true if both are null/undefined or equal
   */
  public static areEqual<T extends { identity: AggregateIdentity }>(
    left: T | null | undefined,
    right: T | null | undefined,
  ): boolean {
    if (left === null || left === undefined) {
      return right === null || right === undefined;
    }

    if (right === null || right === undefined) {
      return false;
    }

    // Both have identity property
    return left.identity.equals(right.identity);
  }

  /**
   * Static method for null-safe inequality comparison.
   *
   * @param left First aggregate (can be null/undefined)
   * @param right Second aggregate (can be null/undefined)
   * @returns true if aggregates are not equal
   */
  public static areNotEqual<T extends { identity: AggregateIdentity }>(
    left: T | null | undefined,
    right: T | null | undefined,
  ): boolean {
    return !this.areEqual(left, right);
  }
}
