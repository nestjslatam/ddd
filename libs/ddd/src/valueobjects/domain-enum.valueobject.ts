export abstract class DomainEnumValueObject<T> {
  readonly value: T;

  constructor(
    value: T,
    public readonly validValues: T[],
  ) {
    this.value = value;
  }
}
