import { AbstractDomainValueObject, Props } from './ddd-core/ddd-base-classes';
import { BrokenRule } from './ddd-core';

// Mock concrete implementations of AbstractDomainValueObject for testing

class TestValueObject extends AbstractDomainValueObject<string> {
  protected businessRules(props: Props<string>): void {
    if (props.value.length < 2) {
      this.addBrokenRule(
        new BrokenRule(
          'TestValueObject',
          'Value must be at least 2 characters long.',
        ),
      );
    }
  }
}

class TestComplexValueObject extends AbstractDomainValueObject<any> {
  protected businessRules(props: Props<any>): void {
    if (props.prop1.length < 2) {
      this.addBrokenRule(
        new BrokenRule(
          'TestComplexValueObject',
          'prop1 must be at least 2 characters long.',
        ),
      );
    }
  }
}

describe('AbstractDomainValueObject', () => {
  describe('Primitive ValueObject', () => {
    it('should create a valid value object', () => {
      const vo = new TestValueObject({ value: 'valid' });
      expect(vo.isValid).toBe(true);
    });

    it('should throw an error for an invalid value object', () => {
      expect(() => new TestValueObject({ value: 'a' })).toThrow(
        'Invalid value object TestValueObject: TestValueObject-Value must be at least 2 characters long.',
      );
    });

    it('should unpack to the primitive value', () => {
      const vo = new TestValueObject({ value: 'valid' });
      expect(vo.unpack()).toBe('valid');
    });

    it('should be equal to another value object with the same value', () => {
      const vo1 = new TestValueObject({ value: 'valid' });
      const vo2 = new TestValueObject({ value: 'valid' });
      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should not be equal to another value object with a different value', () => {
      const vo1 = new TestValueObject({ value: 'valid' });
      const vo2 = new TestValueObject({ value: 'different' });
      expect(vo1.equals(vo2)).toBe(false);
    });
  });

  describe('Complex ValueObject', () => {
    it('should create a valid complex value object', () => {
      const vo = new TestComplexValueObject({ prop1: 'valid', prop2: 123 });
      expect(vo.isValid).toBe(true);
    });

    it('should throw an error for an invalid complex value object', () => {
      expect(
        () => new TestComplexValueObject({ prop1: 'a', prop2: 123 }),
      ).toThrow(
        'Invalid value object TestComplexValueObject: TestComplexValueObject-prop1 must be at least 2 characters long.',
      );
    });

    it('should unpack to the object', () => {
      const props = { prop1: 'valid', prop2: 123 };
      const vo = new TestComplexValueObject(props);
      expect(vo.unpack()).toEqual(props);
    });

    it('should be equal to another complex value object with the same props', () => {
      const vo1 = new TestComplexValueObject({ prop1: 'valid', prop2: 123 });
      const vo2 = new TestComplexValueObject({ prop1: 'valid', prop2: 123 });
      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should not be equal to another complex value object with different props', () => {
      const vo1 = new TestComplexValueObject({ prop1: 'valid', prop2: 123 });
      const vo2 = new TestComplexValueObject({
        prop1: 'different',
        prop2: 456,
      });
      expect(vo1.equals(vo2)).toBe(false);
    });
  });

  describe('Guard Clauses', () => {
    it('should throw an error if props are undefined', () => {
      expect(() => new TestValueObject(undefined as any)).toThrow(
        'Invalid value object TestValueObject: TestValueObject-Props cannot be undefined',
      );
    });

    it('should throw an error if props are empty', () => {
      expect(() => new TestValueObject({} as any)).toThrow(
        'Invalid value object TestValueObject: TestValueObject-Props cannot be empty',
      );
    });
  });
});
