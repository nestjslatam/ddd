import { AggregateIdentity } from './aggregate-identity';
export declare class AggregateEquality<
  T extends {
    identity: AggregateIdentity;
  },
> {
  private readonly identity;
  private readonly aggregateType;
  constructor(
    identity: AggregateIdentity,
    aggregateType: new (...args: any[]) => T,
  );
  equals(obj: unknown): boolean;
  static areEqual<
    T extends {
      identity: AggregateIdentity;
    },
  >(left: T | null | undefined, right: T | null | undefined): boolean;
  static areNotEqual<
    T extends {
      identity: AggregateIdentity;
    },
  >(left: T | null | undefined, right: T | null | undefined): boolean;
}
//# sourceMappingURL=aggregate-equality.d.ts.map
