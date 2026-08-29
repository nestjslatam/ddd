import { AbstractRuleValidator } from '../core/validator-rules/impl/abstract-rule-validator';
import { ArgumentNullException } from '../exceptions/domain.exception';
import { DddValueObject } from '../valueobject';
import { StringNotNullOrEmptyValidator } from './string-notnullorempty.validator';
import {
  StringMaxLengthValidator,
  StringValueObject,
} from './string.valueobject';

/**
 * StringValueObject is the most-used base in the library and had no dedicated
 * suite. The failures worth guarding against here are the ones this package has
 * already shipped: a value object base that threw on every construction, and a
 * subclass whose configuration was read before it existed.
 *
 * The ordering constraint that drives most of these tests: DddValueObject's
 * constructor calls addValidators() and then validate() *before* the subclass
 * constructor body runs. Anything addValidators() reads off the subclass must
 * therefore tolerate being undefined. StringValueObject handles that with a
 * defaults fallback for the first pass, then rebuilds the validators once its
 * own options exist -- the same shape NumberValueObject uses.
 *
 * That rebuild is what makes allowEmpty, trimWhitespace, minLength and
 * maxLength actually reach validation; before it existed they were silently
 * ignored, and empty() returned an *invalid* value object. The
 * 'configured options' block below is the guard against that regressing.
 */
describe('StringValueObject', () => {
  describe('construction', () => {
    it('constructs through the documented factory without throwing', () => {
      // The regression that shipped twice was a crash at construction time, not
      // a wrong validation result, so this is the single most valuable assertion.
      expect(() => StringValueObject.create('hello')).not.toThrow();
      expect(StringValueObject.create('hello').getValue()).toBe('hello');
    });

    it('constructs through load(), the persistence-side factory', () => {
      const loaded = StringValueObject.load('from-db');

      expect(loaded).toBeInstanceOf(StringValueObject);
      expect(loaded.getValue()).toBe('from-db');
    });

    it('constructs when options are supplied', () => {
      // addValidators() runs during super(), before `options` is assigned. If
      // someone replaces the defaults fallback with a direct `this.options.x`
      // read, this is the test that goes red instead of the whole library.
      expect(() =>
        StringValueObject.create('hello', {
          allowEmpty: true,
          trimWhitespace: true,
          minLength: 2,
          maxLength: 10,
        }),
      ).not.toThrow();
    });

    it('constructs from a subclass that passes no options', () => {
      class PlainName extends StringValueObject {
        constructor(value: string) {
          super(value);
        }
      }

      expect(() => new PlainName('abc')).not.toThrow();
    });

    it('constructs from a subclass that passes options', () => {
      // This mirrors the documented ProductCode/Email extension pattern, the
      // shape real consumers write.
      class ProductCode extends StringValueObject {
        constructor(value: string) {
          super(value, { trimWhitespace: true, minLength: 3, maxLength: 20 });
        }

        static make(value: string): ProductCode {
          return new ProductCode(value.toUpperCase());
        }
      }

      const code = ProductCode.make('abc123');

      expect(code.getValue()).toBe('ABC123');
      expect(code).toBeInstanceOf(StringValueObject);
    });

    it.each([[null], [undefined]])(
      'rejects %p before any validation runs',
      (value) => {
        // The base constructor throws rather than recording a broken rule, so
        // there is no instance to inspect. Callers must handle the throw.
        expect(() =>
          StringValueObject.create(value as unknown as string),
        ).toThrow(ArgumentNullException);
      },
    );

    it('preserves the exact input, without trimming or casing it', () => {
      // The value object is a wrapper, not a normalizer: trim()/toUpperCase()
      // are read-side helpers and must never mutate what was stored.
      const padded = StringValueObject.create('  Mixed Case  ');

      expect(padded.getValue()).toBe('  Mixed Case  ');
    });
  });

  describe('default validation', () => {
    it('accepts a non-empty string', () => {
      expect(StringValueObject.create('hello').isValid).toBe(true);
      expect(
        StringValueObject.create('hello').brokenRules.getBrokenRules(),
      ).toHaveLength(0);
    });

    it('rejects the empty string and says why', () => {
      const empty = StringValueObject.create('');
      const rules = empty.brokenRules.getBrokenRules();

      expect(empty.isValid).toBe(false);
      expect(rules).toHaveLength(1);
      expect(rules[0]).toEqual({
        property: 'value',
        message: 'value cannot be empty',
        severity: 'Error',
      });
    });

    it('accepts a whitespace-only string, because trimming is off by default', () => {
      // Surprising but correct per the documented defaults: only '' is empty
      // unless trimWhitespace is enabled. Asserted so that a change to the
      // default is a deliberate, visible break rather than a silent one.
      const spaces = StringValueObject.create('   ');

      expect(spaces.isValid).toBe(true);
      expect(spaces.isEmpty()).toBe(false);
    });

    it('accepts a very short string, because minLength defaults to 0', () => {
      expect(StringValueObject.create('a').isValid).toBe(true);
    });

    it('accepts a very long string, because maxLength defaults to MAX_SAFE_INTEGER', () => {
      const long = StringValueObject.create('x'.repeat(10_000));

      expect(long.isValid).toBe(true);
      expect(long.length).toBe(10_000);
    });
  });

  describe('empty()', () => {
    // empty() is the only factory that forces allowEmpty, so it is the one that
    // most visibly depends on options reaching validation.
    it('produces a valid value object wrapping the empty string', () => {
      const empty = StringValueObject.empty();

      expect(empty).toBeInstanceOf(StringValueObject);
      expect(empty.getValue()).toBe('');
      expect(empty.isEmpty()).toBe(true);
      expect(empty.length).toBe(0);
      // Regression: allowEmpty was forced on and then thrown away, so the
      // factory documented as "the empty one" produced a broken rule saying
      // the value cannot be empty.
      expect(empty.isValid).toBe(true);
      expect(empty.brokenRules.getBrokenRules()).toHaveLength(0);
    });

    it('accepts extra options without throwing', () => {
      expect(() =>
        StringValueObject.empty({ trimWhitespace: true }),
      ).not.toThrow();
    });
  });

  describe('configured options', () => {
    // Regression suite for the defect that made every option a no-op: the
    // constructor assigned `options` after super(), by which point the base had
    // already built the validators from the defaults and never rebuilt them.

    it('accepts the empty string when allowEmpty is set', () => {
      const value = StringValueObject.create('', { allowEmpty: true });

      expect(value.isValid).toBe(true);
      expect(value.brokenRules.getBrokenRules()).toHaveLength(0);
    });

    it('rejects a whitespace-only string when trimWhitespace is set', () => {
      const value = StringValueObject.create('   ', { trimWhitespace: true });

      expect(value.isValid).toBe(false);
      expect(
        value.brokenRules.getBrokenRules().map((rule) => rule.message),
      ).toEqual(['value cannot be empty or contain only whitespace']);
    });

    it('enforces minLength', () => {
      const tooShort = StringValueObject.create('ab', { minLength: 3 });

      expect(tooShort.isValid).toBe(false);
      expect(
        tooShort.brokenRules.getBrokenRules().map((rule) => rule.message),
      ).toEqual([
        'value must be at least 3 characters long (current length: 2)',
      ]);
      expect(StringValueObject.create('abc', { minLength: 3 }).isValid).toBe(
        true,
      );
    });

    it('enforces maxLength instead of throwing', () => {
      // Two defects meet here. maxLength never reached addValidators() at all,
      // and the branch that consumed it pushed a bare object literal into
      // ValidatorRuleManager -- which calls validate() on every entry, so
      // reaching it threw "validator.validate is not a function".
      let value!: StringValueObject;

      expect(() => {
        value = StringValueObject.create('toolong', { maxLength: 3 });
      }).not.toThrow();

      expect(value.isValid).toBe(false);
      expect(
        value.brokenRules.getBrokenRules().map((rule) => rule.message),
      ).toEqual(['value must not exceed 3 characters (current length: 7)']);
    });

    it('treats maxLength as inclusive', () => {
      expect(StringValueObject.create('abc', { maxLength: 3 }).isValid).toBe(
        true,
      );
    });

    it('registers the max-length validator only when a bound is configured', () => {
      // Keeps the default case at exactly one validator; a validator that can
      // never fire is noise in validatorRules.count().
      expect(
        StringValueObject.create('a').validatorRules.has(
          StringMaxLengthValidator,
        ),
      ).toBe(false);
      expect(
        StringValueObject.create('a', { maxLength: 5 }).validatorRules.has(
          StringMaxLengthValidator,
        ),
      ).toBe(true);
    });

    it('re-checks maxLength after setValue()', () => {
      // The validator must read the live value, not a snapshot taken while
      // addValidators() ran.
      const value = StringValueObject.create('ok', { maxLength: 5 });
      expect(value.isValid).toBe(true);

      value.setValue('far too long');
      expect(value.isValid).toBe(false);

      value.setValue('back');
      expect(value.isValid).toBe(true);
    });

    it('measures both length bounds against the same trimmed string', () => {
      // minLength has always been measured after trimming; maxLength must be
      // too, or a padded value can be reported as short and long at once.
      const value = StringValueObject.create('  abc  ', {
        trimWhitespace: true,
        minLength: 3,
        maxLength: 3,
      });

      expect(value.isValid).toBe(true);
      expect(value.getValue()).toBe('  abc  ');
    });

    it('applies the options a subclass passes to super()', () => {
      // The documented extension shape -- and the one that motivated the
      // options in the first place.
      class ProductCode extends StringValueObject {
        constructor(value: string) {
          super(value, { trimWhitespace: true, minLength: 3, maxLength: 6 });
        }
      }

      expect(new ProductCode('ab').isValid).toBe(false);
      expect(new ProductCode('abcdefg').isValid).toBe(false);
      expect(new ProductCode('abc123').isValid).toBe(true);
    });

    it('keeps a chaining subclass validator after the rebuild', () => {
      // The constructor clears and re-runs addValidators(); an override that
      // chains super() must survive that, not be wiped by it.
      class Ticker extends StringValueObject {
        constructor(value: string) {
          super(value, { minLength: 2 });
        }

        override addValidators(): void {
          super.addValidators();
          this.validatorRules.add(new UpperCaseValidator(this));
        }
      }

      const ticker = new Ticker('acme');

      expect(ticker.validatorRules.count()).toBe(2);
      expect(
        ticker.brokenRules.getBrokenRules().map((rule) => rule.message),
      ).toEqual(['value must be uppercase']);
    });
  });

  describe('validator registration', () => {
    it('registers exactly one StringNotNullOrEmptyValidator', () => {
      const value = StringValueObject.create('hello');

      expect(value.validatorRules.count()).toBe(1);
      expect(value.validatorRules.has(StringNotNullOrEmptyValidator)).toBe(
        true,
      );
    });

    it('does not duplicate the base validator when addValidators() runs again', () => {
      // ValidatorRuleManager deduplicates by constructor type. Any future fix
      // that rebuilds validators after the options are assigned relies on this;
      // without it every rebuild would double the broken-rule messages.
      const value = StringValueObject.create('hello');
      value.addValidators();
      value.addValidators();

      expect(value.validatorRules.count()).toBe(1);
    });

    it('runs a subclass validator alongside the inherited one when super() is chained', () => {
      class Ticker extends StringValueObject {
        constructor(value: string) {
          super(value);
        }

        override addValidators(): void {
          super.addValidators();
          this.validatorRules.add(new UpperCaseValidator(this));
        }

        static make(value: string): Ticker {
          return new Ticker(value);
        }
      }

      const lowercase = Ticker.make('acme');
      const uppercase = Ticker.make('ACME');

      expect(lowercase.validatorRules.count()).toBe(2);
      expect(lowercase.isValid).toBe(false);
      expect(
        lowercase.brokenRules.getBrokenRules().map((rule) => rule.message),
      ).toEqual(['value must be uppercase']);
      expect(uppercase.isValid).toBe(true);
    });

    it('still reports the inherited empty-string rule for a chaining subclass', () => {
      class Ticker extends StringValueObject {
        constructor(value: string) {
          super(value);
        }

        override addValidators(): void {
          super.addValidators();
          this.validatorRules.add(new UpperCaseValidator(this));
        }
      }

      const blank = new Ticker('');

      expect(blank.isValid).toBe(false);
      expect(
        blank.brokenRules.getBrokenRules().map((rule) => rule.message),
      ).toContain('value cannot be empty');
    });

    it('drops the inherited validators when an override does not call super()', () => {
      // Documented consequence of the template-method design, and an easy
      // mistake to make: an override that forgets super() silently disables the
      // not-null/not-empty guard rather than failing loudly.
      class Unvalidated extends StringValueObject {
        constructor(value: string) {
          super(value);
        }

        override addValidators(): void {
          // intentionally does not chain
        }
      }

      const blank = new Unvalidated('');

      expect(blank.validatorRules.count()).toBe(0);
      expect(blank.isValid).toBe(true);
    });
  });

  describe('revalidation after setValue()', () => {
    it('turns an initially valid object invalid when set to empty', () => {
      // The validator instance is registered once at construction and re-read
      // on every validate(), so it must observe the *current* value. If a
      // refactor ever snapshots the value into the validator, this goes red.
      const value = StringValueObject.create('ok');
      expect(value.isValid).toBe(true);

      value.setValue('');

      expect(value.isValid).toBe(false);
      expect(
        value.brokenRules.getBrokenRules().map((rule) => rule.message),
      ).toEqual(['value cannot be empty']);
    });

    it('clears the broken rules when a valid value is set again', () => {
      const value = StringValueObject.create('');
      expect(value.isValid).toBe(false);

      value.setValue('recovered');

      expect(value.isValid).toBe(true);
      expect(value.brokenRules.getBrokenRules()).toHaveLength(0);
      expect(value.getValue()).toBe('recovered');
    });

    it('keeps the derived accessors in step with the new value', () => {
      const value = StringValueObject.create('short');
      value.setValue('a much longer value');

      expect(value.length).toBe('a much longer value'.length);
      expect(value.toString()).toBe('a much longer value');
      expect(value.isEmpty()).toBe(false);
    });

    it('moves the tracking state from new to dirty', () => {
      const value = StringValueObject.create('ok');
      expect(value.trackingState.isNew).toBe(true);

      value.setValue('changed');

      expect(value.trackingState.isDirty).toBe(true);
      expect(value.trackingState.isNew).toBe(false);
    });

    it('rejects a null replacement value', () => {
      const value = StringValueObject.create('ok');

      expect(() => value.setValue(null as unknown as string)).toThrow(
        ArgumentNullException,
      );
      expect(value.getValue()).toBe('ok');
    });
  });

  describe('string accessors', () => {
    const value = StringValueObject.create('Hello World');

    it('reports length in UTF-16 code units, not graphemes', () => {
      // Worth pinning: a single astral-plane emoji counts as 2, which is what
      // any minLength/maxLength rule built on `length` will see.
      expect(value.length).toBe(11);
      expect(StringValueObject.create('😀').length).toBe(2);
    });

    it('answers isEmpty() only for the exact empty string', () => {
      expect(value.isEmpty()).toBe(false);
      expect(StringValueObject.create('   ').isEmpty()).toBe(false);
      expect(StringValueObject.empty().isEmpty()).toBe(true);
    });

    it('returns plain strings from the case and trim helpers', () => {
      // Surprising for a value object API: these return raw strings, not new
      // value objects, and leave the receiver untouched.
      const padded = StringValueObject.create('  padded  ');

      expect(value.toUpperCase()).toBe('HELLO WORLD');
      expect(value.toLowerCase()).toBe('hello world');
      expect(padded.trim()).toBe('padded');
      expect(padded.getValue()).toBe('  padded  ');
    });

    it.each([
      ['contains a substring', 'World', true],
      ['is case sensitive in contains', 'world', false],
      ['contains the empty string', '', true],
    ])('%s', (_label, needle, expected) => {
      expect(value.contains(needle as string)).toBe(expected);
    });

    it('checks prefixes and suffixes case-sensitively', () => {
      expect(value.startsWith('Hello')).toBe(true);
      expect(value.startsWith('hello')).toBe(false);
      expect(value.endsWith('World')).toBe(true);
      expect(value.endsWith('world')).toBe(false);
    });
  });

  describe('serialization', () => {
    it('renders as the bare string through toString()', () => {
      expect(StringValueObject.create('hello').toString()).toBe('hello');
      expect(`${StringValueObject.create('hello')}`).toBe('hello');
    });

    it('serializes as a JSON string, not as a wrapper object', () => {
      // Consumers persist these directly; if toJSON is dropped, the payload
      // silently becomes {"options":...} and breaks every stored document.
      const value = StringValueObject.create('hello');

      expect(value.toJSON()).toBe('hello');
      expect(JSON.stringify(value)).toBe('"hello"');
      expect(JSON.stringify({ name: value })).toBe('{"name":"hello"}');
    });
  });

  describe('equality', () => {
    it('treats two instances with the same value as equal', () => {
      const left = StringValueObject.create('same');
      const right = StringValueObject.create('same');

      expect(left).not.toBe(right);
      expect(left.equals(right)).toBe(true);
      expect(left.getHashCode()).toBe(right.getHashCode());
    });

    it('treats different values as unequal', () => {
      expect(
        StringValueObject.create('a').equals(StringValueObject.create('b')),
      ).toBe(false);
    });

    it('is case sensitive', () => {
      expect(
        StringValueObject.create('Case').equals(
          StringValueObject.create('case'),
        ),
      ).toBe(false);
    });

    it.each([[null], [undefined], ['same'], [{ value: 'same' }]])(
      'is not equal to %p',
      (other) => {
        expect(StringValueObject.create('same').equals(other)).toBe(false);
      },
    );

    it('is not equal to a subclass instance holding the same string', () => {
      // Equality compares prototypes first, so a domain subtype never equals
      // the raw base type. Comparing an Email to a plain StringValueObject is
      // false even when both wrap the identical address.
      class Email extends StringValueObject {
        constructor(value: string) {
          super(value);
        }
      }

      const base = StringValueObject.create('a@b.com');
      const email = new Email('a@b.com');

      expect(base.equals(email)).toBe(false);
      expect(email.equals(base)).toBe(false);
      expect(email.equals(new Email('a@b.com'))).toBe(true);
    });

    it('exposes the string itself as the only equality component', () => {
      // getEqualityComponents is protected; reached here through the public
      // contract so the test does not depend on the member name.
      const value = StringValueObject.create('only');
      const differentInstanceSameValue = StringValueObject.load('only');

      expect(value.equals(differentInstanceSameValue)).toBe(true);
      expect(value.getHashCode()).toBe(
        differentInstanceSameValue.getHashCode(),
      );
    });
  });
});

/**
 * Minimal domain-specific validator used to prove that a subclass which chains
 * super.addValidators() keeps the inherited rules and adds its own.
 */
class UpperCaseValidator extends AbstractRuleValidator<DddValueObject<string>> {
  public addRules(): void {
    const value = this.subject.getValue();

    if (value && value !== value.toUpperCase()) {
      this.addBrokenRule('value', 'value must be uppercase');
    }
  }
}
