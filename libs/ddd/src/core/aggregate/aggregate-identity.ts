import { IdValueObject } from '../../valueobjects';

/**
 * Manages aggregate identity and equality comparisons.
 * Encapsulates identity-based equality logic for DDD aggregates.
 *
 * @remarks
 * In DDD, two aggregates are equal if they have the same identity (ID),
 * regardless of their property values. This class centralizes that logic.
 *
 * @example
 * ```typescript
 * const identity1 = AggregateIdentity.create();
 * const identity2 = AggregateIdentity.fromExisting(savedId);
 *
 * identity1.equals(identity2); // false - different IDs
 * ```
 */
export class AggregateIdentity {
  private readonly _id: IdValueObject;

  /**
   * Private constructor to enforce factory methods.
   * @param id The identity value object
   */
  private constructor(id: IdValueObject) {
    this._id = id;
  }

  /**
   * Creates a new identity with a generated ID.
   * @returns A new AggregateIdentity instance
   */
  public static create(): AggregateIdentity {
    return new AggregateIdentity(IdValueObject.create());
  }

  /**
   * Creates an identity from an existing ID.
   * Used when reconstituting aggregates from persistence.
   *
   * @param id Existing identity value object
   * @returns An AggregateIdentity instance
   */
  public static fromExisting(id: IdValueObject): AggregateIdentity {
    return new AggregateIdentity(id);
  }

  /**
   * Gets the identity value object.
   * @returns The ID value object
   */
  public get id(): IdValueObject {
    return this._id;
  }

  /**
   * Compares this identity with another.
   *
   * @param other The other identity to compare
   * @returns true if identities are equal
   */
  public equals(other: AggregateIdentity | null | undefined): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    const thisId = this._id;
    const otherId = other._id;

    if (
      thisId === null ||
      thisId === undefined ||
      otherId === null ||
      otherId === undefined
    ) {
      return false;
    }

    // Use ValueObject equals if available
    if (typeof thisId.equals === 'function') {
      return thisId.equals(otherId);
    }

    // Fallback to strict equality
    return thisId === otherId;
  }

  /**
   * Converts the identity to a string representation.
   * @returns String representation of the ID
   */
  public toString(): string {
    return this._id.toString();
  }
}
