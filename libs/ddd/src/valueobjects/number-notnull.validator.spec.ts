import { BrokenRule } from '../core/business-rules';
import { DddValueObject } from '../valueobject';
import {
  NumberNotNullValidator,
  NumberValidationOptions,
} from './number-notnull.validator';

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
const subjectHolding = (value: unknown): DddValueObject<number> =>
  ({ getValue: () => value }) as unknown as DddValueObject<number>;

const rulesFor = (
  value: unknown,
  options?: Partial<NumberValidationOptions>,
): ReadonlyArray<BrokenRule> =>
  new NumberNotNullValidator(subjectHolding(value), options).validate();

const messagesFor = (
  value: unknown,
  options?: Partial<NumberValidationOptions>,
): string[] => rulesFor(value, options).map((rule) => rule.message);

describe('NumberNotNullValidator', () => {
  describe('with the default options', () => {
    it.each([[0], [-5], [3.14], [Number.MAX_VALUE], [Number.MIN_SAFE_INTEGER]])(
      'accepts the finite number %p',
      (value) => {
        // Deliberately includes zero and negatives: this validator judges
        // *representability*, never sign. Sign is NumberPositiveValidator's
        // job, and merging the two concerns is how allowZero got lost before.
        expect(rulesFor(value)).toHaveLength(0);
      },
    );

    it('rejects null', () => {
      expect(messagesFor(null)).toEqual(['value cannot be null or undefined']);
    });

    it('rejects undefined', () => {
      expect(messagesFor(undefined)).toEqual([
        'value cannot be null or undefined',
      ]);
    });

    it('stops at the null rule instead of cascading', () => {
      // The early return matters: without it, null would fall through to the
      // finite check (Number.isFinite(null) is false) and the caller would get
      // two rules describing one problem.
      expect(rulesFor(null)).toHaveLength(1);
    });

    it('rejects NaN, and reports it only once', () => {
      // The regression this pins: Number.isFinite(NaN) is false, so before the
      // `&& !Number.isNaN(value)` guard NaN broke *both* rules. The count is
      // the assertion, not the message.
      expect(messagesFor(NaN)).toEqual(['value cannot be NaN']);
    });

    it.each([[Infinity], [-Infinity]])('rejects %p', (value) => {
      expect(messagesFor(value)).toEqual(['value must be a finite number']);
    });
  });

  describe('allowNaN', () => {
    it('accepts NaN when enabled', () => {
      expect(rulesFor(NaN, { allowNaN: true })).toHaveLength(0);
    });

    it('does not let NaN through the infinity rule when enabled', () => {
      // The whole point of the guard: allowNaN has to survive a validator that
      // still rejects non-finite values.
      expect(rulesFor(NaN, { allowNaN: true, allowInfinity: false })).toEqual(
        [],
      );
    });

    it('leaves Infinity rejected', () => {
      expect(messagesFor(Infinity, { allowNaN: true })).toEqual([
        'value must be a finite number',
      ]);
    });
  });

  describe('allowInfinity', () => {
    it.each([[Infinity], [-Infinity]])('accepts %p when enabled', (value) => {
      expect(rulesFor(value, { allowInfinity: true })).toHaveLength(0);
    });

    it('leaves NaN rejected, and only as NaN', () => {
      expect(messagesFor(NaN, { allowInfinity: true })).toEqual([
        'value cannot be NaN',
      ]);
    });
  });

  describe('with both allowances enabled', () => {
    const permissive = { allowNaN: true, allowInfinity: true };

    it.each([[NaN], [Infinity], [-Infinity], [0]])('accepts %p', (value) => {
      expect(rulesFor(value, permissive)).toHaveLength(0);
    });

    it('still rejects null -- the one check that cannot be switched off', () => {
      expect(messagesFor(null, permissive)).toEqual([
        'value cannot be null or undefined',
      ]);
    });
  });

  describe('propertyName', () => {
    it('names the offending property in the rule and in the message', () => {
      const [rule] = rulesFor(NaN, { propertyName: 'balance' });

      expect(rule.property).toBe('balance');
      expect(rule.message).toBe('balance cannot be NaN');
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
      const validator = new NumberNotNullValidator(subjectHolding(NaN));

      validator.validate();
      validator.validate();

      expect(validator.validate()).toHaveLength(1);
    });

    it('reflects the subject value at the time of the run', () => {
      let current: number = NaN;
      const validator = new NumberNotNullValidator({
        getValue: () => current,
      } as unknown as DddValueObject<number>);

      expect(validator.validate()).toHaveLength(1);

      current = 42;
      expect(validator.validate()).toHaveLength(0);
    });
  });

  describe('against a real value object', () => {
    class Age extends DddValueObject<number> {
      constructor(value: number) {
        super(value);
      }

      override addValidators(): void {
        super.addValidators();
        this.validatorRules.add(new NumberNotNullValidator(this));
      }

      protected getEqualityComponents(): Iterable<unknown> {
        return [this.getValue()];
      }
    }

    it('marks the value object invalid through the broken rules manager', () => {
      const age = new Age(NaN);

      expect(age.isValid).toBe(false);
      expect(age.brokenRules.getBrokenRules()[0].message).toBe(
        'value cannot be NaN',
      );
    });

    it('leaves a plain number valid, zero included', () => {
      expect(new Age(0).isValid).toBe(true);
    });
  });
});
