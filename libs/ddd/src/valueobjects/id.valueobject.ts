import { v4 as uuidv4, validate as validateUuid } from 'uuid';
import { DddValueObject } from '../valueobject';
// Deep import, not the '../core/validator-rules' barrel: that barrel pulls in
// entity-validator -> aggregate-root -> valueobjects/index -> back here, and
// the cycle leaves AbstractRuleValidator undefined at `extends` time
// ("Class extends value undefined"). The sibling validators import it the same
// way for the same reason.
import { AbstractRuleValidator } from '../core/validator-rules/impl/abstract-rule-validator';
import {
  ArgumentNullException,
  InvalidFormatException,
} from '../exceptions/domain.exception';

/**
 * Rule validator that keeps an identifier's wrapped value a UUID.
 *
 * IdValueObject gates its own entry points by throwing, but a value object is
 * also allowed to be re-validated at any time (getCopy() rebuilds validators,
 * `setValuePropertyChanged` is protected and reachable from a subclass, and an
 * ORM can poke state back in). Registering the invariant as a *rule* is what
 * makes `isValid` answer honestly on those paths instead of reporting true for
 * an identifier that no longer holds a UUID.
 */
export class UuidFormatValidator extends AbstractRuleValidator<
  DddValueObject<string>
> {
  public addRules(): void {
    const value = this.subject.getValue();

    if (!validateUuid(value)) {
      this.addBrokenRule('value', `value must be a valid UUID: '${value}'`);
    }
  }
}

/**
 * Value object representing a unique identifier based on GUID/UUID.
 * Provides static factory methods for safe creation and loading.
 *
 * @remarks
 * This class follows the Factory Method pattern to control instance creation.
 *
 * **UUID version.** {@link create} mints a v4. {@link load} accepts any RFC
 * 4122 UUID (plus the nil UUID that {@link empty} uses), because it is the
 * rehydration path for identifiers this library did not necessarily mint --
 * a v1/v7 key from another service, or a database default, is still a valid
 * identity. Restricting load() to v4 would reject this class's own
 * {@link empty} value, which is not a v4.
 *
 * **Case.** UUIDs are case-insensitive (RFC 4122 §3), so every value is
 * canonicalized to lowercase on the way in. Without that, the same identifier
 * written in two cases produced two unequal identities with two different hash
 * codes.
 *
 * Key features:
 * - Generates cryptographically strong random UUIDs
 * - Validates UUID format on every path that can set the value
 * - Immutable once created
 * - Value-based equality comparison
 *
 * @example
 * ```typescript
 * // Create a new random ID
 * const newId = IdValueObject.create();
 * console.log(newId.getValue()); // e.g., 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
 *
 * // Load an existing ID from string
 * const existingId = IdValueObject.load('f47ac10b-58cc-4372-a567-0e02b2c3d479');
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
   * The identifier used to represent "no identity". Not a v4 UUID -- the nil
   * UUID is its own special case in RFC 4122, which is why load() cannot be
   * narrowed to v4 without rejecting it.
   */
  private static readonly EMPTY_VALUE = '00000000-0000-0000-0000-000000000000';

  /**
   * Initializes a new instance with a specific identifier value.
   * Constructor is protected to enforce use of factory methods (create/load).
   *
   * @param value The UUID value of the identifier
   * @throws {ArgumentNullException} If value is null or undefined
   * @throws {InvalidFormatException} If value is not a valid UUID
   */
  protected constructor(value: string) {
    // Checked BEFORE super(), so no instance can ever exist holding a
    // non-UUID: the base constructor registers the value and marks the object
    // as new, and a subclass reaching this constructor directly (a typed
    // OrderId) would otherwise get the same free pass load() used to be the
    // only guard against.
    super(IdValueObject.assertUuid(value));
  }

  /**
   * Registers the UUID invariant as a validation rule.
   *
   * Safe to run from the base constructor: it reads only the wrapped value,
   * which the base registers before calling this hook, so there is no
   * subclass field to wait for and none of the "rebuild after super()" dance
   * NumberValueObject needs.
   */
  public override addValidators(): void {
    super.addValidators();
    this.validatorRules.add(new UuidFormatValidator(this));
  }

  /**
   * The canonical form of a UUID: lowercase, per RFC 4122 §3, which defines
   * UUIDs as case-insensitive on input and lowercase on output. Non-strings
   * (untyped callers do reach here) pass through untouched for the format
   * check to reject.
   */
  private static canonicalize(value: string): string {
    return typeof value === 'string' ? value.toLowerCase() : value;
  }

  /**
   * The single gate every path that sets an identifier's value goes through.
   *
   * @param value The candidate identifier
   * @returns The canonical (lowercase) UUID
   * @throws {ArgumentNullException} If value is null or undefined
   * @throws {InvalidFormatException} If value is not a valid UUID
   */
  private static assertUuid(value: string): string {
    // Null is checked first so callers get "cannot be null" instead of a
    // format error naming a value they never supplied.
    if (value === null || value === undefined) {
      throw new ArgumentNullException('value');
    }

    const canonical = IdValueObject.canonicalize(value);

    if (!validateUuid(canonical)) {
      // The message says "a valid UUID", not "UUID v4": load() deliberately
      // accepts any RFC 4122 version, and a message promising v4 sent people
      // hunting for a bug that was not there.
      throw new InvalidFormatException('value', 'a valid UUID', value);
    }

    return canonical;
  }

  /**
   * Changes the identifier, enforcing the same UUID invariant as the factory
   * methods.
   *
   * @param value The new UUID value
   * @throws {ArgumentNullException} If value is null or undefined
   * @throws {InvalidFormatException} If value is not a valid UUID
   *
   * @remarks
   * The inherited {@link DddValueObject.setValue} is public and unvalidated,
   * so before this override any holder of an id could overwrite it with
   * arbitrary text and the instance would still report `isValid === true`.
   * Identity is the one value object where that is not a recoverable
   * "broken rule" state -- the aggregate has already been keyed by it -- so
   * this fails fast, exactly like {@link load}.
   *
   * ⚠️ Identifiers should still be treated as immutable; prefer building a
   * new instance over mutating one.
   */
  public override setValue(value: string): void {
    super.setValue(IdValueObject.assertUuid(value));
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
   * Validates that the string is a properly formatted UUID of any RFC 4122
   * version, and canonicalizes it to lowercase.
   *
   * @param value String representation of the UUID identifier
   * @returns IdValueObject instance
   * @throws {ArgumentNullException} If value is null or undefined
   * @throws {InvalidFormatException} If value is not a valid UUID format
   *
   * @example
   * ```typescript
   * // Valid UUID
   * const id = IdValueObject.load('f47ac10b-58cc-4372-a567-0e02b2c3d479');
   *
   * // Case is normalized, so both spellings are the same identity
   * IdValueObject.load('F47AC10B-58CC-4372-A567-0E02B2C3D479')
   *   .equals(id); // true
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
    // The guard lives in the constructor, which every instance goes through;
    // duplicating it here is how the two drifted apart in the first place.
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
   * Generates a hash code derived from the UUID's characters.
   *
   * @returns A 32-bit integer hash
   *
   * @remarks
   * The inherited implementation hashes `JSON.stringify(component).length`,
   * which is 38 for *every* UUID -- so every identifier in the library shared
   * one hash code and any hash-bucketed structure keyed by ids degenerated to
   * a single bucket. This hashes the characters instead (the classic 31-based
   * string hash), so equal ids still hash equally while different ids
   * practically never collide.
   */
  public override getHashCode(): number {
    const value = this.getValue();
    let hash = 0;

    for (let i = 0; i < value.length; i++) {
      // Math.imul keeps the multiplication in 32-bit space; `| 0` wraps the
      // accumulator the same way, so the result never drifts into the
      // imprecise end of the double range.
      hash = (Math.imul(hash, 31) + value.charCodeAt(i)) | 0;
    }

    return hash;
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
    return new IdValueObject(IdValueObject.EMPTY_VALUE);
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
    return this.getValue() === IdValueObject.EMPTY_VALUE;
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
