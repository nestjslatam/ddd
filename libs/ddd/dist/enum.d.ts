export declare abstract class DddEnum {
  readonly id: number;
  readonly name: string;
  private static readonly _cache;
  protected constructor(id: number, name: string);
  private validateId;
  private validateName;
  toString(): string;
  static getAll<T extends DddEnum>(): T[];
  equals(other: unknown): boolean;
  static absoluteDifference(firstValue: DddEnum, secondValue: DddEnum): number;
  static fromValue<T extends DddEnum>(value: number): T | undefined;
  static fromName<T extends DddEnum>(name: string): T | undefined;
  static fromNameIgnoreCase<T extends DddEnum>(name: string): T | undefined;
  static fromDisplayName<T extends DddEnum>(displayName: string): T | undefined;
  compareTo(other: DddEnum): number;
  isLessThan(other: DddEnum): boolean;
  isLessThanOrEqual(other: DddEnum): boolean;
  isGreaterThan(other: DddEnum): boolean;
  isGreaterThanOrEqual(other: DddEnum): boolean;
  static isDefined(value: number): boolean;
  static getMinValue<T extends DddEnum>(): T | undefined;
  static getMaxValue<T extends DddEnum>(): T | undefined;
  isBetween(min: DddEnum, max: DddEnum): boolean;
  static areEqual(
    left: DddEnum | null | undefined,
    right: DddEnum | null | undefined,
  ): boolean;
  static areNotEqual(
    left: DddEnum | null | undefined,
    right: DddEnum | null | undefined,
  ): boolean;
}
//# sourceMappingURL=enum.d.ts.map
