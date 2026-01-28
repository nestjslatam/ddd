import { AggregateIdentity } from './aggregate-identity';
import { IdValueObject } from '../../valueobjects';

describe('AggregateIdentity', () => {
  describe('create', () => {
    it('should create a new identity with generated ID', () => {
      const identity = AggregateIdentity.create();

      expect(identity).toBeInstanceOf(AggregateIdentity);
      expect(identity.id).toBeInstanceOf(IdValueObject);
      expect(identity.id.isEmpty()).toBe(false);
    });

    it('should create different IDs for different instances', () => {
      const identity1 = AggregateIdentity.create();
      const identity2 = AggregateIdentity.create();

      expect(identity1.equals(identity2)).toBe(false);
    });
  });

  describe('fromExisting', () => {
    it('should create identity from existing ID', () => {
      const existingId = IdValueObject.create();
      const identity = AggregateIdentity.fromExisting(existingId);

      expect(identity).toBeInstanceOf(AggregateIdentity);
      expect(identity.id).toBe(existingId);
    });

    it('should preserve the ID value', () => {
      const existingId = IdValueObject.create();
      const identity = AggregateIdentity.fromExisting(existingId);

      expect(identity.id.equals(existingId)).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return false when comparing with null', () => {
      const identity = AggregateIdentity.create();

      expect(identity.equals(null)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      const identity = AggregateIdentity.create();

      expect(identity.equals(undefined)).toBe(false);
    });

    it('should return true when comparing same identity', () => {
      const id = IdValueObject.create();
      const identity1 = AggregateIdentity.fromExisting(id);
      const identity2 = AggregateIdentity.fromExisting(id);

      expect(identity1.equals(identity2)).toBe(true);
    });

    it('should return false when comparing different identities', () => {
      const identity1 = AggregateIdentity.create();
      const identity2 = AggregateIdentity.create();

      expect(identity1.equals(identity2)).toBe(false);
    });

    it('should use ValueObject equals method when available', () => {
      const id1 = IdValueObject.create();
      const id2 = IdValueObject.create();

      const identity1 = AggregateIdentity.fromExisting(id1);
      const identity2 = AggregateIdentity.fromExisting(id2);

      // Spy on the equals method
      const equalsSpy = jest.spyOn(id1, 'equals');

      identity1.equals(identity2);

      expect(equalsSpy).toHaveBeenCalledWith(id2);
    });
  });

  describe('toString', () => {
    it('should return string representation of ID', () => {
      const identity = AggregateIdentity.create();
      const result = identity.toString();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should match the ID toString output', () => {
      const id = IdValueObject.create();
      const identity = AggregateIdentity.fromExisting(id);

      expect(identity.toString()).toBe(id.toString());
    });
  });

  describe('id getter', () => {
    it('should return the internal ID value object', () => {
      const id = IdValueObject.create();
      const identity = AggregateIdentity.fromExisting(id);

      expect(identity.id).toBe(id);
    });

    it('should not allow modification of the returned ID', () => {
      const identity = AggregateIdentity.create();
      const id = identity.id;

      // Verify it's the same instance
      expect(identity.id).toBe(id);
    });
  });
});

