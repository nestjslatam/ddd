/**
 * Represents a domain enum value object.
 * @template T - The type of the enum value.
 */
export class DomainEnum<T> {
  readonly value: T;

  constructor(
    value: T,
    public readonly validValues: T[],
  ) {
    this.value = value;
  }
}
