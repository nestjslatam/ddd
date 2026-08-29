import { BrokenRule } from '../core/business-rules';
import { DddValueObject } from '../valueobject';
import {
  StringNotNullOrEmptyValidator,
  StringValidationOptions,
} from './string-notnullorempty.validator';

/**
 * The validator is exported on its own and documented for use inside any
 * hand-written value object, so it is tested as a unit: the subject is a stub
 * whose only contract with the validator is getValue().
 *
 * A stub is the *only* way to reach the null branch. DddValueObject's
 * constructor throws ArgumentNullException on a null value and setValue() does
 * the same, so no real value object can ever hold null -- but the validator is
 * public API and can be pointed at props rehydrated from persistence, where a
 * missing column really does arrive as null.
 */
const subjectHolding = (value: unknown): DddValueObject<string> =>
  ({ getValue: () => value }) as unknown as DddValueObject<string>;

const rulesFor = (
  value: unknown,
  options?: Partial<StringValidationOptions>,
): ReadonlyArray<BrokenRule> =>
  new StringNotNullOrEmptyValidator(subjectHolding(value), options).validate();

const messagesFor = (
  value: unknown,
  options?: Partial<StringValidationOptions>,
): string[] => rulesFor(value, options).map((rule) => rule.message);

describe('StringNotNullOrEmptyValidator', () => {
  describe('with the default options', () => {
    it.each([['hello'], ['a'], ['  padded  ']])('accepts %p', (value) => {
      expect(rulesFor(value)).toHaveLength(0);
    });

    it('accepts a whitespace-only string, because trimming is opt-in', () => {
      // Not an oversight: trimWhitespace defaults to false, so '   ' is three
      // characters of content. The test exists so that flipping the default
      // shows up as a deliberate breaking change rather than a surprise.
      expect(rulesFor('   ')).toHaveLength(0);
    });

    it('rejects null', () => {
      expect(messagesFor(null)).toEqual(['value cannot be null or undefined']);
    });

    it('rejects undefined', () => {
      expect(messagesFor(undefined)).toEqual([
        'value cannot be null or undefined',
      ]);
    });

    it('stops at the null rule instead of dereferencing the value', () => {
      // The early return is load-bearing, not tidiness: the next statement is
      // value.trim(), which would throw on null and take the whole validation
      // pass down with it.
      expect(() => rulesFor(null, { trimWhitespace: true })).not.toThrow();
      expect(rulesFor(null, { trimWhitespace: true })).toHaveLength(1);
    });

    it('rejects the empty string without mentioning whitespace', () => {
      expect(messagesFor('')).toEqual(['value cannot be empty']);
    });
  });

  describe('trimWhitespace', () => {
    it('treats a whitespace-only string as empty when enabled', () => {
      expect(messagesFor('   ', { trimWhitespace: true })).toEqual([
        'value cannot be empty or contain only whitespace',
      ]);
    });

    it('says so in the message only when trimming is on', () => {
      // Two different messages from one template. The wording is the only
      // signal the caller gets about which rule actually fired.
      expect(messagesFor('', { trimWhitespace: true })[0]).toContain(
        'or contain only whitespace',
      );
      expect(messagesFor('', { trimWhitespace: false })[0]).not.toContain(
        'whitespace',
      );
    });

    it('accepts a padded string that has content once trimmed', () => {
      expect(rulesFor('  hi  ', { trimWhitespace: true })).toHaveLength(0);
    });

    it('measures minLength against the trimmed value', () => {
      // The regression risk here is the local reassignment `value = value.trim()`
      // being dropped or moved below the length check, which would let '  ab  '
      // pass a minLength of 3 on its padding alone.
      expect(
        messagesFor('  ab  ', { trimWhitespace: true, minLength: 3 }),
      ).toEqual([
        'value must be at least 3 characters long (current length: 2)',
      ]);

      expect(rulesFor('  ab  ', { minLength: 3 })).toHaveLength(0);
    });
  });

  describe('allowEmpty', () => {
    it('accepts the empty string when enabled', () => {
      expect(rulesFor('', { allowEmpty: true })).toHaveLength(0);
    });

    it('accepts a whitespace-only string when enabled together with trimming', () => {
      expect(
        rulesFor('   ', { allowEmpty: true, trimWhitespace: true }),
      ).toHaveLength(0);
    });

    it('still rejects null -- the one check that cannot be switched off', () => {
      expect(messagesFor(null, { allowEmpty: true })).toEqual([
        'value cannot be null or undefined',
      ]);
    });

    it('does not exempt the empty string from minLength', () => {
      // allowEmpty only skips the empty *rule*; the length check still runs and
      // an empty string is length 0. Contradictory options, but callers do
      // write them, and this is what they get.
      expect(messagesFor('', { allowEmpty: true, minLength: 3 })).toEqual([
        'value must be at least 3 characters long (current length: 0)',
      ]);
    });
  });

  describe('minLength', () => {
    it('reports the requirement and the actual length', () => {
      expect(messagesFor('ab', { minLength: 5 })).toEqual([
        'value must be at least 5 characters long (current length: 2)',
      ]);
    });

    it.each([
      ['below the boundary', 'ab', false],
      ['exactly at the boundary', 'abc', true],
      ['above the boundary', 'abcd', true],
    ])('%s: %p is accepted=%s', (_label, value, accepted) => {
      expect(rulesFor(value, { minLength: 3 })).toHaveLength(accepted ? 0 : 1);
    });

    it('uses the singular noun for a minimum of one', () => {
      expect(messagesFor('', { allowEmpty: true, minLength: 1 })).toEqual([
        'value must be at least 1 character long (current length: 0)',
      ]);
    });

    it('is disabled at zero, its default', () => {
      expect(rulesFor('', { allowEmpty: true, minLength: 0 })).toHaveLength(0);
      expect(rulesFor('a', { allowEmpty: true })).toHaveLength(0);
    });

    it('does not fire on top of the empty rule', () => {
      // The empty check returns early, so a caller gets one rule describing the
      // real problem rather than "cannot be empty" plus "too short".
      expect(messagesFor('', { minLength: 5 })).toEqual([
        'value cannot be empty',
      ]);
    });
  });

  describe('propertyName', () => {
    it('names the offending property in the rule and in the message', () => {
      const [rule] = rulesFor('', { propertyName: 'code' });

      expect(rule.property).toBe('code');
      expect(rule.message).toBe('code cannot be empty');
    });

    it('defaults to "value"', () => {
      expect(rulesFor(null)[0].property).toBe('value');
    });
  });

  describe('repeated validation', () => {
    it('does not accumulate rules across runs', () => {
      // validate() clears its buffer first. A value object revalidates on every
      // setValue(), so an accumulating validator would grow one duplicate rule
      // per mutation.
      const validator = new StringNotNullOrEmptyValidator(subjectHolding(''));

      validator.validate();
      validator.validate();

      expect(validator.validate()).toHaveLength(1);
    });

    it('reflects the subject value at the time of the run', () => {
      let current = '';
      const validator = new StringNotNullOrEmptyValidator({
        getValue: () => current,
      } as unknown as DddValueObject<string>);

      expect(validator.validate()).toHaveLength(1);

      current = 'filled in';
      expect(validator.validate()).toHaveLength(0);
    });
  });

  describe('against a real value object', () => {
    class ProductCode extends DddValueObject<string> {
      constructor(value: string) {
        super(value);
      }

      override addValidators(): void {
        super.addValidators();
        this.validatorRules.add(
          new StringNotNullOrEmptyValidator(this, {
            trimWhitespace: true,
            minLength: 3,
            propertyName: 'code',
          }),
        );
      }

      protected getEqualityComponents(): Iterable<unknown> {
        return [this.getValue()];
      }
    }

    it('marks the value object invalid through the broken rules manager', () => {
      const code = new ProductCode('   ');

      expect(code.isValid).toBe(false);
      expect(code.brokenRules.getBrokenRules()[0].message).toBe(
        'code cannot be empty or contain only whitespace',
      );
    });

    it('revalidates when the value changes', () => {
      const code = new ProductCode('AB');

      expect(code.isValid).toBe(false);

      code.setValue('ABC');
      expect(code.isValid).toBe(true);
    });
  });
});
