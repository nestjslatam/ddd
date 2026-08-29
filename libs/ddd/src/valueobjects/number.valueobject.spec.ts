import { AbstractRuleValidator } from '../core/validator-rules/impl/abstract-rule-validator';
import { DddValueObject } from '../valueobject';
import {
  DEFAULT_NUMBER_OPTIONS,
  NumberValueObject,
} from './number.valueobject';
import { NumberNotNullValidator } from './number-notnull.validator';
import { NumberPositiveValidator } from './number-positive.validator';

/**
 * Regression cover for a construction-order defect that made every
 * NumberValueObject unusable.
 *
 * DddValueObject's constructor calls addValidators(); NumberValueObject
 * assigned `this.options` only after super() returned, so addValidators() read
 * `this.options.allowNaN` on undefined and threw. Nothing exercised it: the
 * suites live under libs/ddd and the sample app's coverage config excludes the
 * valueobjects folder, so the class shipped broken in 2.0.0 and 2.1.x.
 *
 * The second half of the suite covers the rest of the public surface -- the
 * factories, the predicates, the conversions, equality and the option wiring --
 * which had no tests at all. The option-wiring block is the important one: it
 * asserts that the constructor's `validatorRules.clear(); addValidators();
 * validate();` rebuild really does hand the caller's options to the validators.
 * Deleting that rebuild leaves every value still *constructible*, so only a
 * test that inspects the resulting validator set catches the regression.
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

  describe('validator wiring', () => {
    // These assertions are the ones that survive a refactor of the rebuild in
    // the constructor. `isValid` alone cannot distinguish "the option was
    // honoured" from "the default happened to agree with the option", so the
    // validator set itself is inspected.
    it('registers the null and positive validators by default', () => {
      const rules = NumberValueObject.create(1).validatorRules;

      expect(rules.has(NumberNotNullValidator)).toBe(true);
      expect(rules.has(NumberPositiveValidator)).toBe(true);
      expect(rules.count()).toBe(2);
    });

    it('omits the positive validator when requirePositive is false', () => {
      const rules = NumberValueObject.create(1, {
        requirePositive: false,
      }).validatorRules;

      expect(rules.has(NumberNotNullValidator)).toBe(true);
      expect(rules.has(NumberPositiveValidator)).toBe(false);
    });

    it('does not leave the pre-options validators behind after the rebuild', () => {
      // super() adds a first pair built from the defaults; the constructor
      // clears them before adding the configured pair. Without the clear() the
      // manager would still hold the stale default-configured instances --
      // it de-duplicates by constructor type, so the *stale* ones would win
      // and every option would be silently ignored.
      const value = NumberValueObject.create(0, { allowZero: true });
      const positive = value.validatorRules.findByType(NumberPositiveValidator);

      expect(value.validatorRules.count()).toBe(2);
      expect(positive?.validate()).toHaveLength(0);
    });

    it('hands allowNaN and allowInfinity to the NumberNotNullValidator', () => {
      const value = NumberValueObject.create(NaN, {
        allowNaN: true,
        allowInfinity: true,
        requirePositive: false,
      });
      const notNull = value.validatorRules.findByType(NumberNotNullValidator);

      expect(notNull).toBeDefined();
      expect(notNull?.validate()).toHaveLength(0);
    });

    it('hands epsilon to the NumberPositiveValidator', () => {
      const value = NumberValueObject.create(0.002, { epsilon: 0.001 });
      const positive = value.validatorRules.findByType(NumberPositiveValidator);

      expect(positive).toBeDefined();
      expect(positive?.validate()).toHaveLength(0);
      expect(value.isValid).toBe(true);
    });
  });

  describe('epsilon tolerance', () => {
    // Boundaries, not samples: epsilon is a threshold and the comparison is
    // `<=` on the strict side and `< -epsilon` on the allowZero side.
    it.each([
      ['just under epsilon', 0.0005, false],
      ['exactly epsilon', 0.001, false],
      ['just over epsilon', 0.0011, true],
    ])(
      'strictly positive with epsilon: %s is valid=%s',
      (_label, value, expected) => {
        expect(
          NumberValueObject.create(value as number, { epsilon: 0.001 }).isValid,
        ).toBe(expected);
      },
    );

    it.each([
      ['within the negative tolerance', -0.0005, true],
      ['exactly at the negative tolerance', -0.001, true],
      ['beyond the negative tolerance', -0.0011, false],
    ])(
      'non-negative with epsilon: %s is valid=%s',
      (_label, value, expected) => {
        expect(
          NumberValueObject.create(value as number, {
            allowZero: true,
            epsilon: 0.001,
          }).isValid,
        ).toBe(expected);
      },
    );
  });

  describe('factory methods', () => {
    it('load() is create() with a persistence-side name', () => {
      const loaded = NumberValueObject.load(7);

      expect(loaded).toBeInstanceOf(NumberValueObject);
      expect(loaded.getValue()).toBe(7);
      expect(loaded.isValid).toBe(true);
      expect(loaded.equals(NumberValueObject.create(7))).toBe(true);
    });

    it('load() forwards its options', () => {
      expect(
        NumberValueObject.load(-3, { requirePositive: false }).isValid,
      ).toBe(true);
    });

    it('zero() produces a valid zero, which create(0) does not', () => {
      expect(NumberValueObject.zero().getValue()).toBe(0);
      expect(NumberValueObject.zero().isValid).toBe(true);
      expect(NumberValueObject.create(0).isValid).toBe(false);
    });

    it('zero() overrides a caller who asks for allowZero:false', () => {
      // `{ ...options, allowZero: true }` -- the override has to come last, or
      // zero() would hand back an instance that is invalid by construction.
      expect(NumberValueObject.zero({ allowZero: false }).isValid).toBe(true);
    });

    it('zero() still forwards the caller options it does not override', () => {
      const rules = NumberValueObject.zero({
        requirePositive: false,
      }).validatorRules;

      expect(rules.has(NumberPositiveValidator)).toBe(false);
    });

    it('one() produces a valid 1 under the default positive rule', () => {
      expect(NumberValueObject.one().getValue()).toBe(1);
      expect(NumberValueObject.one().isValid).toBe(true);
    });

    it('one() forwards its options', () => {
      const rules = NumberValueObject.one({
        requirePositive: false,
      }).validatorRules;

      expect(rules.has(NumberPositiveValidator)).toBe(false);
    });
  });

  describe('numeric predicates', () => {
    const unconstrained = (value: number) =>
      NumberValueObject.create(value, { requirePositive: false });

    it.each([
      ['a positive number', 5, false, true, false],
      ['zero', 0, true, false, false],
      ['a negative number', -5, false, false, true],
    ])(
      '%s: isZero=%s isPositive=%s isNegative=%s',
      (_label, value, zero, positive, negative) => {
        const subject = unconstrained(value as number);

        expect(subject.isZero()).toBe(zero);
        expect(subject.isPositive()).toBe(positive);
        expect(subject.isNegative()).toBe(negative);
      },
    );

    it('treats -0 as zero, and as neither positive nor negative', () => {
      // -0 === 0 is true and -0 < 0 is false, so all three predicates agree
      // with `zero`. Pinned because a rewrite in terms of Math.sign() or
      // Object.is() would quietly change isZero() for -0.
      const negativeZero = unconstrained(-0);

      expect(negativeZero.isZero()).toBe(true);
      expect(negativeZero.isPositive()).toBe(false);
      expect(negativeZero.isNegative()).toBe(false);
    });

    it('reports the predicates of an invalid value without throwing', () => {
      // The value object is a report of what is wrong, not a gate: -5 under the
      // default options is invalid and still answers every predicate.
      const invalid = NumberValueObject.create(-5);

      expect(invalid.isValid).toBe(false);
      expect(invalid.isNegative()).toBe(true);
    });
  });

  describe('conversions', () => {
    it('toNumber() returns the wrapped primitive', () => {
      const value = NumberValueObject.create(3.5);

      expect(value.toNumber()).toBe(3.5);
      expect(value.toNumber()).toBe(value.getValue());
    });

    it('toString() renders the number, not [object Object]', () => {
      expect(NumberValueObject.create(3.5).toString()).toBe('3.5');
      expect(`${NumberValueObject.create(42)}`).toBe('42');
    });

    it('toJSON() serialises as a bare number, not as a wrapper object', () => {
      // The assertion that matters: JSON.stringify of a *containing* object.
      // Losing toJSON() turns this into {"total":{}} and silently corrupts
      // every payload the value object appears in.
      const payload = JSON.stringify({
        total: NumberValueObject.create(99.99),
      });

      expect(payload).toBe('{"total":99.99}');
      expect(NumberValueObject.create(99.99).toJSON()).toBe(99.99);
    });
  });

  describe('equality', () => {
    it('is equal to another instance wrapping the same number', () => {
      const a = NumberValueObject.create(10);
      const b = NumberValueObject.load(10);

      expect(a.equals(b)).toBe(true);
      expect(a === b).toBe(false);
      expect(a.getHashCode()).toBe(b.getHashCode());
    });

    it('is not equal to an instance wrapping a different number', () => {
      expect(
        NumberValueObject.create(10).equals(NumberValueObject.create(11)),
      ).toBe(false);
    });

    it('ignores the options when comparing -- only the number counts', () => {
      // getEqualityComponents() returns [value]; the configuration is not part
      // of the identity of the value.
      const strict = NumberValueObject.create(5);
      const loose = NumberValueObject.create(5, { requirePositive: false });

      expect(strict.equals(loose)).toBe(true);
    });

    it('is not equal to a subclass wrapping the same number', () => {
      class Quantity extends NumberValueObject {
        constructor(value: number) {
          super(value, { allowZero: true });
        }
      }

      expect(NumberValueObject.create(1).equals(new Quantity(1))).toBe(false);
    });
  });

  describe('subclassing', () => {
    it('applies the options a subclass passes to super()', () => {
      // The documented Quantity example. It only works because the base
      // constructor rebuilds the validators once the options exist.
      class Quantity extends NumberValueObject {
        constructor(value: number) {
          super(value, { requirePositive: true, allowZero: true });
        }

        static zeroQuantity(): Quantity {
          return new Quantity(0);
        }
      }

      expect(Quantity.zeroQuantity().isValid).toBe(true);
      expect(new Quantity(-1).isValid).toBe(false);
    });

    it('keeps a subclass validator that chains super.addValidators()', () => {
      class EvenNumber extends NumberValueObject {
        constructor(value: number) {
          super(value, { allowZero: true });
        }

        override addValidators(): void {
          super.addValidators();
          this.validatorRules.add(new EvenValidator(this));
        }
      }

      const odd = new EvenNumber(3);

      expect(odd.validatorRules.count()).toBe(3);
      expect(odd.isValid).toBe(false);
      expect(new EvenNumber(4).isValid).toBe(true);
    });
  });

  describe('mutation and copying', () => {
    it('revalidates when the value is replaced', () => {
      const value = NumberValueObject.create(5);

      value.setValue(-3);
      expect(value.isValid).toBe(false);

      value.setValue(4);
      expect(value.isValid).toBe(true);
      expect(value.brokenRules.getBrokenRules()).toHaveLength(0);
    });

    it('carries the options into a copy', () => {
      // getCopy() re-runs addValidators() on the copy. If the options failed to
      // travel, the copy would fall back to the defaults and a legitimately
      // zero-valued quantity would come back invalid.
      const zero = NumberValueObject.create(0, { allowZero: true });
      const copy = zero.getCopy() as NumberValueObject;

      expect(copy.isValid).toBe(true);
      expect(copy.getValue()).toBe(0);
      expect(copy.equals(zero)).toBe(true);
      expect(copy).not.toBe(zero);
    });
  });

  describe('DEFAULT_NUMBER_OPTIONS', () => {
    it('is the configuration an option-less value object actually runs with', () => {
      // Exported so callers can spread it; it is also the fallback used while
      // the base constructor runs. A drift between the two is the bug this
      // pins -- e.g. flipping requirePositive here without noticing that the
      // pre-options validation pass reads the same object.
      expect(DEFAULT_NUMBER_OPTIONS).toEqual({
        requirePositive: true,
        allowZero: false,
        allowNaN: false,
        allowInfinity: false,
        epsilon: 0,
      });

      const explicit = NumberValueObject.create(1, DEFAULT_NUMBER_OPTIONS);

      expect(explicit.validatorRules.count()).toBe(
        NumberValueObject.create(1).validatorRules.count(),
      );
    });
  });
});

/**
 * Domain validator used to prove that a NumberValueObject subclass which
 * chains super.addValidators() keeps the configured rules and adds its own.
 */
class EvenValidator extends AbstractRuleValidator<DddValueObject<number>> {
  public addRules(): void {
    const value = this.subject.getValue();

    if (Number.isInteger(value) && value % 2 !== 0) {
      this.addBrokenRule('value', 'value must be even');
    }
  }
}
