import { AbstractRuleValidator } from './core/validator-rules';
import { ArgumentNullException } from './exceptions/domain.exception';
import { DddValueObject } from './valueobject';

/**
 * DddValueObject is one of the two bases everything in this library is built
 * on, and the one with the most implicit contracts: the constructor pins the
 * runtime type of the wrapped value, addValidators() runs *before* any
 * subclass constructor body, validate() re-runs on every value change, and
 * equals() is prototype-aware. None of that is enforced by the type system,
 * so it is enforced here.
 *
 * The version that shipped as 2.x crashed on construction for every
 * NumberValueObject because of the addValidators() ordering alone; the
 * ordering tests below exist to make that class of break fail loudly.
 */

/** Minimal concrete value object: a single component, the wrapped value. */
class Wrapped<TValue> extends DddValueObject<TValue> {
  constructor(value: TValue) {
    super(value);
  }

  protected getEqualityComponents(): Iterable<any> {
    return [this.getValue()];
  }

  /** validate() is protected; subclasses are its intended callers. */
  public revalidate(): void {
    this.validate();
  }
}

class MinLengthRule extends AbstractRuleValidator<DddValueObject<string>> {
  constructor(
    subject: DddValueObject<string>,
    private readonly min: number,
  ) {
    super(subject);
  }

  addRules(): void {
    if (this.subject.getValue().length < this.min) {
      this.addBrokenRule('value', `value must be at least ${this.min} long`);
    }
  }
}

class NoDigitsRule extends AbstractRuleValidator<DddValueObject<string>> {
  addRules(): void {
    if (/\d/.test(this.subject.getValue())) {
      this.addBrokenRule('value', 'value must not contain digits');
    }
  }
}

/** A value object whose validators are fixed, the ordinary case. */
class Label extends Wrapped<string> {
  override addValidators(): void {
    super.addValidators();
    this.validatorRules.add(new MinLengthRule(this, 3));
  }
}

describe('DddValueObject', () => {
  describe('construction', () => {
    it('refuses null and undefined, the only two values it rejects outright', () => {
      expect(() => new Wrapped<string>(null as any)).toThrow(
        ArgumentNullException,
      );
      expect(() => new Wrapped<string>(undefined as any)).toThrow(
        'value cannot be null or undefined',
      );
    });

    // The guard is `value === null || value === undefined` rather than
    // `!value` for a reason: a Quantity of 0, an empty Note and a false Flag
    // are all legitimate value objects. A truthiness check here would reject
    // them, and the type system would not notice.
    it.each([
      ['zero', 0],
      ['the empty string', ''],
      ['false', false],
    ])('accepts %s, which is falsy but not null', (_label, value) => {
      const vo = new Wrapped<any>(value);

      expect(vo.getValue()).toBe(value);
    });

    it('wires up the three managers every subclass reads', () => {
      const vo = new Wrapped('x');

      expect(vo.brokenRules).toBeDefined();
      expect(vo.validatorRules).toBeDefined();
      expect(vo.trackingState).toBeDefined();
      expect(vo.validatorRules.isEmpty()).toBe(true);
    });

    it('marks the instance as new, never as dirty', () => {
      const vo = new Wrapped('x');

      expect(vo.trackingState.isNew).toBe(true);
      expect(vo.trackingState.isDirty).toBe(false);
    });

    it('validates once during construction, so isValid is meaningful immediately', () => {
      // A caller's factory reads `isValid` on the line after `new`. If the
      // constructor stopped calling validate(), that check would silently
      // pass for every invalid value.
      const tooShort = new Label('ab');

      expect(tooShort.isValid).toBe(false);
      expect(tooShort.brokenRules.getBrokenRules()[0].message).toContain(
        'at least 3',
      );
    });
  });

  describe('the runtime type registered for the wrapped value', () => {
    // getTypeConstructor maps typeof to a constructor so the inherited
    // property-change machinery can type-check later writes. Every primitive
    // it names has to round-trip, or the whole class is unusable for that
    // type -- which is how NumberValueObject shipped broken.
    it.each([
      ['string', 'text'],
      ['number', 42],
      ['boolean', true],
      ['symbol', Symbol('token')],
      // Built from a string: the numeric literal exceeds MAX_SAFE_INTEGER and
      // would lose precision before BigInt ever saw it.
      ['bigint', BigInt('9007199254740993')],
    ])('constructs over a %s value', (_label, value) => {
      const vo = new Wrapped<any>(value);

      expect(vo.getValue()).toBe(value);
    });

    it.each([
      ['a plain object', { city: 'Lima' }],
      ['an array', [1, 2, 3]],
      ['a Date', new Date(0)],
      ['a function', () => 1],
    ])(
      'constructs over %s, taking the type from its constructor',
      (_label, value) => {
        const vo = new Wrapped<any>(value);

        expect(vo.getValue()).toBe(value);
      },
    );

    it('accepts a later value of a subtype of the registered type', () => {
      class Animal {
        constructor(public readonly name: string) {}
      }
      class Dog extends Animal {}

      const vo = new Wrapped<Animal>(new Animal('generic'));
      vo.setValue(new Dog('rex'));

      expect(vo.getValue().name).toBe('rex');
    });
  });

  describe('addValidators', () => {
    it('runs from the base constructor, before any subclass field exists', () => {
      // This is the ordering that broke NumberValueObject in 2.0.0 and 2.1.x:
      // addValidators() reads subclass configuration that has not been
      // assigned yet. It is not a bug in the base -- there is no other point
      // at which the base can build the validator set -- but every subclass
      // has to be written knowing it.
      const trace: string[] = [];

      class Traced extends DddValueObject<string> {
        private limit!: number;

        constructor(value: string, limit: number) {
          super(value);
          this.limit = limit;
          trace.push(`constructor body, limit=${this.limit}`);
        }

        override addValidators(): void {
          trace.push(`addValidators, limit=${this.limit}`);
        }

        protected getEqualityComponents(): Iterable<any> {
          return [this.getValue()];
        }
      }

      new Traced('x', 3);

      expect(trace).toEqual([
        'addValidators, limit=undefined',
        'constructor body, limit=3',
      ]);
    });

    it('is public so a configured subclass can rebuild its rules afterwards', () => {
      // The documented remedy for the ordering above, and the reason
      // addValidators() is public on this base while it is protected on the
      // aggregate base: clear, re-add, re-validate once the configuration
      // exists. If it were narrowed to protected, this pattern -- and
      // NumberValueObject with it -- stops compiling.
      class ConfiguredLabel extends DddValueObject<string> {
        private readonly min: number;

        constructor(value: string, min: number) {
          super(value);
          this.min = min;

          this.validatorRules.clear();
          this.addValidators();
          this.validate();
        }

        override addValidators(): void {
          super.addValidators();
          // `min` is undefined on the first pass; fall back the way
          // NumberValueObject does rather than throwing.
          this.validatorRules.add(new MinLengthRule(this, this.min ?? 1));
        }

        protected getEqualityComponents(): Iterable<any> {
          return [this.getValue()];
        }
      }

      // Without the rebuild the first pass would have used min=1 and called
      // this valid.
      expect(new ConfiguredLabel('ab', 5).isValid).toBe(false);
      expect(new ConfiguredLabel('abcde', 5).isValid).toBe(true);
    });

    it('adds nothing on the base, leaving an unconstrained value object valid', () => {
      const vo = new Wrapped('anything at all');

      expect(vo.validatorRules.isEmpty()).toBe(true);
      expect(vo.isValid).toBe(true);
    });

    it('collects every registered validator, not just the first', () => {
      class Strict extends Wrapped<string> {
        override addValidators(): void {
          super.addValidators();
          this.validatorRules.add(new MinLengthRule(this, 3));
          this.validatorRules.add(new NoDigitsRule(this));
        }
      }

      const messages = new Strict('a1').brokenRules
        .getBrokenRules()
        .map((r) => r.message);

      expect(messages).toHaveLength(2);
      expect(messages.join(' ')).toContain('digits');
    });
  });

  describe('validate', () => {
    it('clears stale broken rules before recollecting', () => {
      // validate() is called on every value change. If it stopped clearing
      // first, a value object could never become valid again -- the errors
      // from the bad value would outlive it.
      const label = new Label('ab');
      expect(label.isValid).toBe(false);

      label.setValue('abcd');

      expect(label.isValid).toBe(true);
      expect(label.brokenRules.getBrokenRules()).toHaveLength(0);
    });

    it('re-runs on every value change, in both directions', () => {
      const label = new Label('abcd');
      expect(label.isValid).toBe(true);

      label.setValue('a');

      expect(label.isValid).toBe(false);
      expect(label.brokenRules.getBrokenRules()).toHaveLength(1);
    });

    it('is idempotent, so a subclass may call it as often as it likes', () => {
      const label = new Label('ab');

      label.revalidate();
      label.revalidate();

      // Not three copies of the same error: validate() clears, and the
      // broken-rules manager deduplicates on top of that.
      expect(label.brokenRules.getBrokenRules()).toHaveLength(1);
    });
  });

  describe('isValid', () => {
    it('is a getter, so `if (!vo.isValid)` reads a boolean and not a function', () => {
      const descriptor = Object.getOwnPropertyDescriptor(
        DddValueObject.prototype,
        'isValid',
      );

      expect(typeof descriptor?.get).toBe('function');
      expect(typeof new Wrapped('x').isValid).toBe('boolean');
    });

    it('tracks the broken-rules manager rather than caching a result', () => {
      const label = new Label('ab');
      expect(label.isValid).toBe(false);

      label.brokenRules.clear();

      expect(label.isValid).toBe(true);
    });
  });

  describe('setValue', () => {
    it('refuses null and undefined and leaves the previous value in place', () => {
      const vo = new Wrapped('keep');

      expect(() => vo.setValue(null as any)).toThrow(ArgumentNullException);
      expect(() => vo.setValue(undefined as any)).toThrow(
        ArgumentNullException,
      );
      expect(vo.getValue()).toBe('keep');
    });

    it('moves the instance from new to dirty', () => {
      // markAsDirty resets every other flag, so a mutated value object is no
      // longer reported as new -- a repository that branches on isNew will
      // update instead of insert.
      const vo = new Wrapped('before');
      vo.setValue('after');

      expect(vo.trackingState.isDirty).toBe(true);
      expect(vo.trackingState.isNew).toBe(false);
    });

    it('does nothing at all when the value is unchanged', () => {
      // The inherited property-change machinery compares with ===, so writing
      // the same value fires no callback: no dirty flag and no revalidation.
      // Anything that relies on setValue always re-validating is relying on
      // behaviour this base does not have.
      const vo = new Wrapped('same');
      vo.trackingState.markAsClean();

      vo.setValue('same');

      expect(vo.trackingState.isDirty).toBe(false);
    });

    it('treats a distinct but structurally identical object as a change', () => {
      // The same === comparison, seen from the other side: object values are
      // compared by reference, so an equal-looking replacement does count.
      const vo = new Wrapped<{ n: number }>({ n: 1 });
      vo.trackingState.markAsClean();

      vo.setValue({ n: 1 });

      expect(vo.trackingState.isDirty).toBe(true);
    });

    it('notifies subscribers, callbacks before the event', () => {
      const seen: string[] = [];
      const vo = new Wrapped('old');
      vo.onPropertyChanged = (name) => seen.push(`event:${name}`);
      vo.registerPropertyChangedCallback('internalValue', (_sender, args) =>
        seen.push(`callback:${args.previousValue}->${args.newValue}`),
      );

      vo.setValue('new');

      expect(seen).toEqual(['callback:old->new', 'event:internalValue']);
    });
  });

  describe('equals', () => {
    class Money extends Wrapped<number> {}
    class Weight extends Wrapped<number> {}

    it('is false for null and undefined rather than throwing', () => {
      const money = new Money(5);

      expect(money.equals(null)).toBe(false);
      expect(money.equals(undefined)).toBe(false);
    });

    it.each([
      ['a plain object', {}],
      ['a primitive', 5],
      ['an object with no prototype', Object.create(null)],
    ])('is false for %s', (_label, other) => {
      expect(new Money(5).equals(other)).toBe(false);
    });

    it('is true for the same class with the same components', () => {
      expect(new Money(5).equals(new Money(5))).toBe(true);
    });

    it('is false for two classes that happen to wrap the same value', () => {
      // The prototype check is the whole point: 5 dollars is not 5 kilograms,
      // even though both value objects report [5] as their components. Drop
      // the check and every single-number value object in a domain collapses
      // into one.
      expect(new Money(5).equals(new Weight(5))).toBe(false);
      expect(new Weight(5).equals(new Money(5))).toBe(false);
    });

    it('is false between a base and its own subclass, in both directions', () => {
      class Discounted extends Money {}

      expect(new Money(5).equals(new Discounted(5))).toBe(false);
      expect(new Discounted(5).equals(new Money(5))).toBe(false);
    });

    it('is false when the two sides declare a different number of components', () => {
      class Tags extends DddValueObject<string[]> {
        constructor(value: string[]) {
          super(value);
        }
        protected getEqualityComponents(): Iterable<any> {
          return this.getValue();
        }
      }

      expect(new Tags(['a']).equals(new Tags(['a', 'b']))).toBe(false);
      expect(new Tags(['a', 'b']).equals(new Tags(['a', 'b']))).toBe(true);
    });

    it('compares components positionally, so their order is part of the contract', () => {
      class Point extends DddValueObject<{ x: number; y: number }> {
        constructor(value: { x: number; y: number }) {
          super(value);
        }
        protected getEqualityComponents(): Iterable<any> {
          const { x, y } = this.getValue();
          return [x, y];
        }
      }

      expect(new Point({ x: 1, y: 2 }).equals(new Point({ x: 2, y: 1 }))).toBe(
        false,
      );
      expect(new Point({ x: 1, y: 2 }).equals(new Point({ x: 1, y: 2 }))).toBe(
        true,
      );
    });

    it('compares object components by reference, never structurally', () => {
      // Surprising, and the most common way to get equals() wrong: returning
      // the wrapped object itself as a component degrades value equality to
      // identity. getEqualityComponents() has to spread the object into
      // primitives, as Point above does.
      const shared = { id: 'a' };

      expect(new Wrapped(shared).equals(new Wrapped(shared))).toBe(true);
      expect(new Wrapped({ id: 'a' }).equals(new Wrapped({ id: 'a' }))).toBe(
        false,
      );
    });
  });

  describe('getHashCode', () => {
    it('is equal for value objects that are equal', () => {
      // The one hash contract worth having: equal objects must not hash
      // differently, or a Map keyed on the hash loses entries. The reverse
      // does not hold -- the digest is built from JSON lengths and collides
      // freely, so it is a bucket hint and never an identity.
      const a = new Wrapped('test@example.com');
      const b = new Wrapped('test@example.com');

      expect(a.equals(b)).toBe(true);
      expect(a.getHashCode()).toBe(b.getHashCode());
    });

    it('is stable across repeated calls on the same instance', () => {
      const vo = new Wrapped('stable');

      expect(vo.getHashCode()).toBe(vo.getHashCode());
    });

    it('follows the value when the value changes', () => {
      const vo = new Wrapped('short');
      const before = vo.getHashCode();

      vo.setValue('considerably longer');

      expect(vo.getHashCode()).not.toBe(before);
    });

    it('returns an integer for multi-component value objects', () => {
      class Triple extends DddValueObject<number[]> {
        constructor(value: number[]) {
          super(value);
        }
        protected getEqualityComponents(): Iterable<any> {
          return this.getValue();
        }
      }

      const hash = new Triple([1, 2, 3]).getHashCode();

      expect(Number.isInteger(hash)).toBe(true);
    });

    it('is 0 for a value object that declares no components', () => {
      // And such a value object is equal to every other instance of its
      // class, whatever it wraps -- the direct consequence of comparing an
      // empty component list. Worth knowing before returning [] from
      // getEqualityComponents().
      class Anonymous extends DddValueObject<string> {
        constructor(value: string) {
          super(value);
        }
        protected getEqualityComponents(): Iterable<any> {
          return [];
        }
      }

      expect(new Anonymous('a').getHashCode()).toBe(0);
      expect(new Anonymous('a').equals(new Anonymous('b'))).toBe(true);
    });
  });

  describe('getCopy and clone', () => {
    it('returns a new instance of the same class', () => {
      const original = new Label('abcd');
      const copy = original.getCopy();

      expect(copy).not.toBe(original);
      expect(copy).toBeInstanceOf(Label);
    });

    it('produces a copy that compares equal to the original', () => {
      const original = new Label('abcd');

      expect(original.equals(original.getCopy())).toBe(true);
    });

    it('clone() is the same operation under another name', () => {
      const original = new Label('abcd');
      const clone = original.clone() as Label;

      expect(clone).not.toBe(original);
      expect(clone).toBeInstanceOf(Label);
      expect(original.equals(clone)).toBe(true);
    });

    // The block below is the reason getCopy() is not one line. Until 3.0.0 it
    // was `Object.assign(Object.create(proto), this)`, and every piece of
    // state a value object owns -- the inherited property map that holds the
    // value, the broken rules, the validators, the tracking state -- is an own
    // enumerable property, so all four were copied by reference. The result
    // was an alias wearing a copy's name, on the one kind of object in this
    // library that is defined by being immutable.

    it('gives the copy its own value, in both directions', () => {
      const original = new Label('abcd');
      const copy = original.getCopy();

      copy.setValue('wxyz');

      expect(original.getValue()).toBe('abcd');
      expect(copy.getValue()).toBe('wxyz');

      original.setValue('mnop');

      expect(copy.getValue()).toBe('wxyz');
    });

    it('gives the copy its own broken rules', () => {
      const original = new Label('abcd');
      const copy = original.getCopy();

      expect(copy.brokenRules).not.toBe(original.brokenRules);

      copy.setValue('ab');

      // Two things at once: the copy collected its own error, and the
      // original did not. If the copy's validators still pointed at the
      // original -- as a by-reference copy of the manager leaves them -- the
      // copy would have been validated against 'abcd' and come out valid.
      expect(copy.isValid).toBe(false);
      expect(original.isValid).toBe(true);
      expect(original.brokenRules.getBrokenRules()).toHaveLength(0);
    });

    it('gives the copy its own validators, built against the copy', () => {
      const original = new Label('abcd');
      const copy = original.getCopy();

      expect(copy.validatorRules).not.toBe(original.validatorRules);
      expect(copy.validatorRules.count()).toBe(original.validatorRules.count());

      // Disarming the original must not disarm the copy.
      original.validatorRules.clear();
      copy.setValue('ab');

      expect(copy.isValid).toBe(false);
    });

    it('gives the copy its own tracking state', () => {
      const original = new Label('abcd');
      const copy = original.getCopy();

      expect(copy.trackingState).not.toBe(original.trackingState);

      copy.trackingState.markAsClean();

      expect(original.trackingState.isNew).toBe(true);
    });

    it('mirrors the tracking state rather than resetting it', () => {
      // The copy holds the same value, so it sits where the original sits: a
      // copy of a dirty value object is dirty, not new. Only the manager is
      // new.
      const original = new Label('abcd');
      original.setValue('efgh');

      const copy = original.getCopy();

      expect(copy.trackingState.isDirty).toBe(true);
      expect(copy.trackingState.isNew).toBe(false);
    });

    it('does not report the copy changes back to the original', () => {
      // The property-change handler is bound to the instance that registered
      // it. Inherit the original's property map and every write to the copy
      // marks the *original* dirty and revalidates it.
      const seen: string[] = [];
      const original = new Label('abcd');
      original.onPropertyChanged = (name) => seen.push(name);
      original.trackingState.markAsClean();

      const copy = original.getCopy();
      copy.setValue('wxyz');

      expect(original.trackingState.isDirty).toBe(false);
      expect(seen).toEqual([]);
    });

    it('carries the subclass configuration, so the copy validates the same way', () => {
      // getCopy() never runs the subclass constructor -- its signature is
      // unknown to the base, NumberValueObject takes options and Label takes
      // none -- so subclass fields have to be transferred before the copy
      // builds its validators. Without that the copy silently falls back to
      // the defaults, which is the addValidators() ordering bug all over
      // again, this time on the copy.
      class ConfigurableLabel extends Wrapped<string> {
        constructor(
          value: string,
          private readonly min?: number,
        ) {
          super(value);

          this.validatorRules.clear();
          this.addValidators();
          this.validate();
        }

        override addValidators(): void {
          super.addValidators();
          this.validatorRules.add(new MinLengthRule(this, this.min ?? 1));
        }
      }

      const copy = new ConfigurableLabel('abcdef', 5).getCopy();

      expect(copy.isValid).toBe(true);

      copy.setValue('abcd');

      // min=5, not the fallback of 1 the first validator pass sees.
      expect(copy.isValid).toBe(false);
    });

    it('clone() is independent too, being the same operation', () => {
      const original = new Label('abcd');
      const clone = original.clone() as Label;

      clone.setValue('wxyz');

      expect(original.getValue()).toBe('abcd');
    });
  });
});
