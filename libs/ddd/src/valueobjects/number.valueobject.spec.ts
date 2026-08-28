import { NumberValueObject } from './number.valueobject';

/**
 * Regression cover for a construction-order defect that made every
 * NumberValueObject unusable.
 *
 * DddValueObject's constructor calls addValidators(); NumberValueObject
 * assigned `this.options` only after super() returned, so addValidators() read
 * `this.options.allowNaN` on undefined and threw. Nothing exercised it: the
 * suites live under libs/ddd and the sample app's coverage config excludes the
 * valueobjects folder, so the class shipped broken in 2.0.0 and 2.1.x.
 */
describe('NumberValueObject', () => {
  describe('construction', () => {
    it('constructs with defaults, the case that used to throw', () => {
      expect(() => NumberValueObject.create(10)).not.toThrow();
      expect(NumberValueObject.create(10).getValue()).toBe(10);
    });

    it('constructs when options are supplied', () => {
      expect(() =>
        NumberValueObject.create(5, { requirePositive: false }),
      ).not.toThrow();
    });

    it('constructs from a subclass that passes no options', () => {
      class Plain extends NumberValueObject {
        constructor(value: number) {
          super(value);
        }
      }
      expect(() => new Plain(3)).not.toThrow();
    });
  });

  describe('default validation', () => {
    it.each([
      ['a positive number', 10, true],
      ['zero', 0, false],
      ['a negative number', -5, false],
      ['NaN', NaN, false],
      ['Infinity', Infinity, false],
    ])('treats %s as valid=%s', (_label, value, expected) => {
      expect(NumberValueObject.create(value as number).isValid).toBe(expected);
    });
  });

  describe('options actually reach the validators', () => {
    // The first fix restored construction but left options ignored, because
    // the only addValidators() pass ran before they were assigned.
    it('accepts zero when allowZero is set', () => {
      expect(NumberValueObject.create(0, { allowZero: true }).isValid).toBe(
        true,
      );
    });

    it('accepts negatives when requirePositive is off', () => {
      expect(
        NumberValueObject.create(-10, { requirePositive: false }).isValid,
      ).toBe(true);
    });

    it('accepts Infinity when allowInfinity is set', () => {
      expect(
        NumberValueObject.create(Infinity, {
          allowInfinity: true,
          requirePositive: false,
        }).isValid,
      ).toBe(true);
    });

    it('accepts NaN when allowNaN is set', () => {
      // NaN previously tripped the infinity rule as well, because
      // Number.isFinite(NaN) is false.
      expect(
        NumberValueObject.create(NaN, {
          allowNaN: true,
          requirePositive: false,
        }).isValid,
      ).toBe(true);
    });
  });

  describe('broken rules', () => {
    it('reports why a value is invalid rather than throwing', () => {
      const value = NumberValueObject.create(-5);
      const messages = value.brokenRules.getBrokenRules().map((r) => r.message);

      expect(value.isValid).toBe(false);
      expect(messages.join(' ')).toContain('positive');
    });

    it('leaves a valid value with no broken rules', () => {
      expect(
        NumberValueObject.create(42).brokenRules.getBrokenRules(),
      ).toHaveLength(0);
    });
  });
});
