import { IdValueObject } from '../../valueobjects';
export declare class AggregateIdentity {
  private readonly _id;
  private constructor();
  static create(): AggregateIdentity;
  static fromExisting(id: IdValueObject): AggregateIdentity;
  get id(): IdValueObject;
  equals(other: AggregateIdentity | null | undefined): boolean;
  toString(): string;
}
//# sourceMappingURL=aggregate-identity.d.ts.map
