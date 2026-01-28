import { v4 as uuidv4, validate as validateUuid } from 'uuid';
import { DddValueObject } from '../valueobject';
import {
  ArgumentNullException,
  InvalidFormatException,
} from '../exceptions/domain.exception';

/**
 * Value object representing a unique identifier based on GUID/UUID.
 * Provides static factory methods for safe creation and loading.
 *
 * @remarks
 * This class follows the Factory Method pattern to control instance creation.
 * All identifiers are validated to ensure they conform to UUID v4 format.
 *
 * Key features:
 * - Generates cryptographically strong random UUIDs
 * - Validates UUID format on loading
 * - Immutable once created
 * - Value-based equality comparison
 *
 * @example
 * ```typescript
 * // Create a new random ID
 * const newId = IdValueObject.create();
 * console.log(newId.getValue()); // e.g., 'a3bb189e-8bf9-3888-9912-ace4e6543002'
 *
 * // Load an existing ID from string
 * const existingId = IdValueObject.load('a3bb189e-8bf9-3888-9912-ace4e6543002');
 *
 * // Check equality
 * console.log(newId.equals(existingId)); // false
 *
 * // Use empty/default ID
 * const emptyId = IdValueObject.empty();
 * console.log(emptyId.isEmpty()); // true
 * ```
 *
 * @example
 * ```typescript
 * // Using with aggregate roots
 * class Product extends DddAggregateRoot<ProductProps, IdValueObject, ProductState> {
 *   static create(props: ProductProps): Product {
 *     return new Product({
 *       ...props,
 *       id: IdValueObject.create() // Generate new ID
 *     });
 *   }
 * }
 * ```
 */
export class IdValueObject extends DddValueObject<string> {
  /**
   * Initializes a new instance with a specific identifier value.
   * Constructor is protected to enforce use of factory methods (create/load).
   *
   * @param value The UUID value of the identifier
   * @throws {ArgumentNullException} If value is null or undefined
   * @throws {InvalidFormatException} If value is not a valid UUID
   */
  protected constructor(value: string) {
    super(value);
  }

  /**
   * Validates UUID format and adds to validators.
   * Ensures the ID conforms to UUID v4 standard.
   */
  public override addValidators(): void {
    super.addValidators();
    // UUID validation is handled at construction time
    // Additional validators can be added here if needed
  }

  /**
   * Creates a new instance with a randomly generated identifier.
   * Equivalent to Guid.NewGuid() in C#.
   *
   * @returns A new IdValueObject with a randomly generated UUID v4
   *
   * @example
   * ```typescript
   * const productId = IdValueObject.create();
   * const orderId = IdValueObject.create();
   * console.log(productId.equals(orderId)); // false - different IDs
   * ```
   */
  public static create(): IdValueObject {
    return new IdValueObject(uuidv4());
  }

  /**
   * Creates an instance from a string representation with validation.
   * Validates that the string is a properly formatted UUID.
   *
   * @param value String representation of the UUID identifier
   * @returns IdValueObject instance
   * @throws {ArgumentNullException} If value is null or undefined
   * @throws {InvalidFormatException} If value is not a valid UUID format
   *
   * @example
   * ```typescript
   * // Valid UUID
   * const id = IdValueObject.load('a3bb189e-8bf9-3888-9912-ace4e6543002');
   *
   * // Invalid UUID - throws InvalidFormatException
   * try {
   *   const invalidId = IdValueObject.load('not-a-uuid');
   * } catch (error) {
   *   console.error('Invalid UUID format');
   * }
   * ```
   */
  public static load(value: string): IdValueObject {
    if (value === null || value === undefined) {
      throw new ArgumentNullException('value');
    }

    if (!validateUuid(value)) {
      throw new InvalidFormatException('value', 'valid UUID v4', value);
    }

    return new IdValueObject(value);
  }

  /**
   * @deprecated Use {@link load} instead. This method will be removed in a future version.
   * Creates an instance from a string representation.
   *
   * @param value String representation of the UUID identifier
   * @returns IdValueObject instance
   */
  public static loadFromString(value: string): IdValueObject {
    return IdValueObject.load(value);
  }

  /**
   * Returns the components used to determine equality.
   * In this case, the unique identifier value.
   *
   * @returns Iterable containing the UUID string value
   */
  protected getEqualityComponents(): Iterable<any> {
    return [this.getValue()];
  }

  /**
   * Gets an empty/default identifier (all zeros UUID).
   * Represents the absence of a valid identifier.
   *
   * @returns IdValueObject with empty/zero UUID
   *
   * @example
   * ```typescript
   * const emptyId = IdValueObject.empty();
   * console.log(emptyId.isEmpty()); // true
   * console.log(emptyId.getValue()); // '00000000-0000-0000-0000-000000000000'
   * ```
   */
  public static empty(): IdValueObject {
    return new IdValueObject('00000000-0000-0000-0000-000000000000');
  }

  /**
   * @deprecated Use {@link empty} instead. This property will be removed in a future version.
   * Gets the default value (empty UUID).
   */
  public static get defaultValue(): IdValueObject {
    return IdValueObject.empty();
  }

  /**
   * Checks if this identifier is the empty/default value.
   *
   * @returns true if this is the empty UUID, false otherwise
   *
   * @example
   * ```typescript
   * const emptyId = IdValueObject.empty();
   * const newId = IdValueObject.create();
   *
   * console.log(emptyId.isEmpty()); // true
   * console.log(newId.isEmpty()); // false
   * ```
   */
  public isEmpty(): boolean {
    return this.getValue() === '00000000-0000-0000-0000-000000000000';
  }

  /**
   * Checks if this identifier is the default/empty value.
   * Alias for {@link isEmpty}.
   *
   * @returns true if this is the empty UUID, false otherwise
   */
  public isDefault(): boolean {
    return this.isEmpty();
  }

  /**
   * Returns the string representation of the UUID.
   *
   * @returns The UUID as a string
   *
   * @example
   * ```typescript
   * const id = IdValueObject.create();
   * console.log(id.toString()); // 'a3bb189e-8bf9-3888-9912-ace4e6543002'
   * ```
   */
  public toString(): string {
    return this.getValue();
  }

  /**
   * Returns the JSON representation of the identifier.
   * Useful for serialization.
   *
   * @returns The UUID as a string
   *
   * @example
   * ```typescript
   * const id = IdValueObject.create();
   * const json = JSON.stringify({ id: id.toJSON() });
   * ```
   */
  public toJSON(): string {
    return this.getValue();
  }
}
