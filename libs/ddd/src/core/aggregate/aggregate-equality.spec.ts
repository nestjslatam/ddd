import { AggregateEquality } from './aggregate-equality';
import { AggregateIdentity } from './aggregate-identity';

// Test aggregate class
class TestAggregate {
  constructor(public identity: AggregateIdentity) {}
}

// Different aggregate class
class DifferentAggregate {
  constructor(public identity: AggregateIdentity) {}
}

describe('AggregateEquality', () => {
  let identity1: AggregateIdentity;
  let identity2: AggregateIdentity;

  beforeEach(() => {
    identity1 = AggregateIdentity.create();
    identity2 = AggregateIdentity.create();
  });

  describe('constructor', () => {
    it('should create an equality comparator', () => {
      const equality = new AggregateEquality(identity1, TestAggregate);

      expect(equality).toBeInstanceOf(AggregateEquality);
    });
  });

  describe('equals', () => {
    it('should return false when comparing with null', () => {
      const aggregate = new TestAggregate(identity1);
      const equality = new AggregateEquality(identity1, TestAggregate);

      expect(equality.equals(null)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      const aggregate = new TestAggregate(identity1);
      const equality = new AggregateEquality(identity1, TestAggregate);

      expect(equality.equals(undefined)).toBe(false);
    });

    it('should return false when comparing with different type', () => {
      const testAggregate = new TestAggregate(identity1);
      const differentAggregate = new DifferentAggregate(identity1);
      const equality = new AggregateEquality(identity1, TestAggregate);

      expect(equality.equals(differentAggregate)).toBe(false);
    });

    it('should return true when comparing aggregates with same identity', () => {
      const aggregate1 = new TestAggregate(identity1);
      const aggregate2 = new TestAggregate(identity1);
      const equality = new AggregateEquality(identity1, TestAggregate);

      expect(equality.equals(aggregate1)).toBe(true);
      expect(equality.equals(aggregate2)).toBe(true);
    });

    it('should return false when comparing aggregates with different identities', () => {
      const aggregate1 = new TestAggregate(identity1);
      const aggregate2 = new TestAggregate(identity2);
      const equality = new AggregateEquality(identity1, TestAggregate);

      expect(equality.equals(aggregate2)).toBe(false);
    });
  });

  describe('areEqual (static)', () => {
    it('should return true when both are null', () => {
      expect(AggregateEquality.areEqual(null, null)).toBe(true);
    });

    it('should return true when both are undefined', () => {
      expect(AggregateEquality.areEqual(undefined, undefined)).toBe(true);
    });

    it('should return false when left is null and right is not', () => {
      const aggregate = new TestAggregate(identity1);

      expect(AggregateEquality.areEqual(null, aggregate)).toBe(false);
    });

    it('should return false when left is not null and right is null', () => {
      const aggregate = new TestAggregate(identity1);

      expect(AggregateEquality.areEqual(aggregate, null)).toBe(false);
    });

    it('should return true when both aggregates have same identity', () => {
      const aggregate1 = new TestAggregate(identity1);
      const aggregate2 = new TestAggregate(identity1);

      expect(AggregateEquality.areEqual(aggregate1, aggregate2)).toBe(true);
    });

    it('should return false when aggregates have different identities', () => {
      const aggregate1 = new TestAggregate(identity1);
      const aggregate2 = new TestAggregate(identity2);

      expect(AggregateEquality.areEqual(aggregate1, aggregate2)).toBe(false);
    });

    it('should work with different aggregate types having same identity', () => {
      const testAggregate = new TestAggregate(identity1);
      const differentAggregate = new DifferentAggregate(identity1);

      // Should be true because we only compare identities
      expect(
        AggregateEquality.areEqual(testAggregate, differentAggregate as any),
      ).toBe(true);
    });
  });

  describe('areNotEqual (static)', () => {
    it('should return false when both are null', () => {
      expect(AggregateEquality.areNotEqual(null, null)).toBe(false);
    });

    it('should return false when both are undefined', () => {
      expect(AggregateEquality.areNotEqual(undefined, undefined)).toBe(false);
    });

    it('should return true when left is null and right is not', () => {
      const aggregate = new TestAggregate(identity1);

      expect(AggregateEquality.areNotEqual(null, aggregate)).toBe(true);
    });

    it('should return true when aggregates have different identities', () => {
      const aggregate1 = new TestAggregate(identity1);
      const aggregate2 = new TestAggregate(identity2);

      expect(AggregateEquality.areNotEqual(aggregate1, aggregate2)).toBe(true);
    });

    it('should return false when aggregates have same identity', () => {
      const aggregate1 = new TestAggregate(identity1);
      const aggregate2 = new TestAggregate(identity1);

      expect(AggregateEquality.areNotEqual(aggregate1, aggregate2)).toBe(false);
    });
  });
});

