import { validate as validateUuid } from 'uuid';
import { IdValueObject, UuidFormatValidator } from './id.valueobject';
import {
  ArgumentNullException,
  DomainException,
  InvalidFormatException,
} from '../exceptions/domain.exception';

/**
 * IdValueObject is the identity every aggregate and entity in this library is
 * keyed by, so its failure modes are not local: a break here corrupts equality,
 * persistence round-trips and repository lookups everywhere at once.
 *
 * The suite is written around the invariants a consumer actually depends on:
 *  - create() must mint a real UUID v4 that load() can read back,
 *  - untrusted input must be rejected before an instance exists,
 *  - empty() must survive a toString() -> load() round trip, because that is
 *    how a null foreign key comes back out of a database,
 *  - equality/serialization must stay value-based.
 *
 *  - the UUID invariant must hold on EVERY path that can set the value, not
 *    only load(): the inherited public setValue() and the protected
 *    constructor are just as reachable, and an id that silently becomes
 *    'not-a-uuid' while still reporting isValid === true is a hole in the
 *    aggregate identity of the whole library.
 *
 * Two decisions are pinned here rather than left implicit: load() accepts any
 * RFC 4122 version (only create() promises v4), and values are canonicalized
 * to lower case so one identifier cannot become two identities.
 */
describe('IdValueObject', () => {
  const NIL_UUID = '00000000-0000-0000-0000-000000000000';
  // A canonical, lowercase v4: version nibble 4, variant nibble in [89ab].
  const V4_UUID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  describe('create', () => {
    it('mints a value that the uuid library itself accepts', () => {
      // Guards against a regression where create() stops delegating to uuidv4
      // (e.g. a hand-rolled Math.random id): the emitted value would still look
      // id-shaped but would no longer be loadable.
      const id = IdValueObject.create();

      expect(validateUuid(id.getValue())).toBe(true);
    });

    it('mints version 4 specifically, not just any UUID shape', () => {
      const value = IdValueObject.create().getValue();

      // Positions 14 and 19 carry the version and variant nibbles.
      expect(value.charAt(14)).toBe('4');
      expect('89ab').toContain(value.charAt(19));
    });

    it('never returns the empty identifier', () => {
      // A generator that degrades to the nil UUID would silently make every new
      // aggregate look like an unsaved/absent one.
      expect(IdValueObject.create().isEmpty()).toBe(false);
    });

    it('produces distinct values across many calls', () => {
      const values = new Set(
        Array.from({ length: 500 }, () => IdValueObject.create().getValue()),
      );

      expect(values.size).toBe(500);
    });

    it('marks the new identifier as new and not yet dirty', () => {
      // Change tracking is set up by the base constructor; if the factory ever
      // stops going through it, repositories would misclassify inserts.
      const id = IdValueObject.create();

      expect(id.trackingState.isNew).toBe(true);
      expect(id.trackingState.isDirty).toBe(false);
    });

    it('round trips through load', () => {
      const original = IdValueObject.create();
      const reloaded = IdValueObject.load(original.toString());

      expect(reloaded.equals(original)).toBe(true);
    });
  });

  describe('load', () => {
    it('accepts a canonical UUID and preserves it byte for byte', () => {
      // load() must not silently rewrite the caller's identifier: the stored
      // string is the database key.
      expect(IdValueObject.load(V4_UUID).getValue()).toBe(V4_UUID);
    });

    it('accepts the nil UUID so empty() survives a persistence round trip', () => {
      // The nil UUID is not a v4, so a v4-only load() would reject the value
      // empty() itself mints: any id column persisted from empty() would fail
      // to rehydrate.
      const reloaded = IdValueObject.load(IdValueObject.empty().toString());

      expect(reloaded.isEmpty()).toBe(true);
    });

    it.each([
      ['null', null],
      ['undefined', undefined],
    ])('rejects %s with ArgumentNullException', (_label, value) => {
      // The null guard must run BEFORE the format check: otherwise callers get
      // a format error naming a value they never supplied, and validateUuid
      // would have to be null-safe.
      expect(() => IdValueObject.load(value as unknown as string)).toThrow(
        ArgumentNullException,
      );
    });

    it.each([
      ['an empty string', ''],
      ['arbitrary text', 'not-a-uuid'],
      ['a brace-wrapped UUID (C# "B" format)', `{${V4_UUID}}`],
      ['a dash-less UUID (C# "N" format)', V4_UUID.replace(/-/g, '')],
      ['a UUID with leading whitespace', ` ${V4_UUID}`],
      ['a UUID with trailing whitespace', `${V4_UUID} `],
      [
        'a UUID with an invalid variant nibble',
        'f47ac10b-58cc-4372-c567-0e02b2c3d479',
      ],
      ['a truncated UUID', V4_UUID.slice(0, -1)],
      ['an over-long UUID', `${V4_UUID}0`],
      [
        'a non-hex character in the payload',
        'g47ac10b-58cc-4372-a567-0e02b2c3d479',
      ],
    ])('rejects %s with InvalidFormatException', (_label, value) => {
      expect(() => IdValueObject.load(value as string)).toThrow(
        InvalidFormatException,
      );
    });

    it.each([
      ['a number', 123],
      ['a boolean', true],
      ['an object', {}],
      ['an array', []],
    ])(
      'rejects %s with InvalidFormatException rather than crashing',
      (_label, value) => {
        // Untyped callers (JSON bodies, query params) reach this method at
        // runtime; validateUuid must not be handed something it can't type-check.
        expect(() => IdValueObject.load(value as unknown as string)).toThrow(
          InvalidFormatException,
        );
      },
    );

    it('does not construct an instance when validation fails', () => {
      // Failing closed matters: a half-built id escaping the guard would carry
      // an unvalidated value through the rest of the domain.
      let escaped: IdValueObject | undefined;

      expect(() => {
        escaped = IdValueObject.load('not-a-uuid');
      }).toThrow();
      expect(escaped).toBeUndefined();
    });

    it('names the offending value in the error message', () => {
      // The message is the only diagnostic a caller gets for a bad id coming
      // off the wire.
      expect(() => IdValueObject.load('not-a-uuid')).toThrow(
        expect.objectContaining({
          message: expect.stringContaining('not-a-uuid'),
        }),
      );
    });

    it('throws errors that are catchable as DomainException and as Error', () => {
      // Consumers catch on the domain base class; losing the prototype chain
      // (a classic TypeScript "extends Error" regression) would make every
      // `catch (e) { if (e instanceof DomainException) }` silently miss.
      const thrown = (() => {
        try {
          IdValueObject.load('not-a-uuid');
          return null;
        } catch (error) {
          return error;
        }
      })();

      expect(thrown).toBeInstanceOf(InvalidFormatException);
      expect(thrown).toBeInstanceOf(DomainException);
      expect(thrown).toBeInstanceOf(Error);
      expect((thrown as Error).name).toBe('InvalidFormatException');
    });
  });

  describe('loadFromString (deprecated)', () => {
    it('still delegates to load for valid input', () => {
      // Kept for back-compat; the alias must not drift away from load().
      expect(IdValueObject.loadFromString(V4_UUID).getValue()).toBe(V4_UUID);
    });

    it('still rejects malformed input the same way load does', () => {
      expect(() => IdValueObject.loadFromString('not-a-uuid')).toThrow(
        InvalidFormatException,
      );
      expect(() =>
        IdValueObject.loadFromString(null as unknown as string),
      ).toThrow(ArgumentNullException);
    });
  });

  describe('empty and defaultValue', () => {
    it('uses the all-zeros UUID as the empty identifier', () => {
      // The exact literal is part of the persisted contract, not an internal
      // detail: rows written with it must keep matching isEmpty().
      expect(IdValueObject.empty().getValue()).toBe(NIL_UUID);
    });

    it('returns a fresh instance on every call but an equal value', () => {
      const first = IdValueObject.empty();
      const second = IdValueObject.empty();

      expect(first).not.toBe(second);
      expect(first.equals(second)).toBe(true);
    });

    it('exposes the same identifier through the deprecated defaultValue getter', () => {
      expect(IdValueObject.defaultValue.equals(IdValueObject.empty())).toBe(
        true,
      );
    });

    it('returns a new instance from defaultValue on each access', () => {
      // It is a getter, not a cached singleton, so mutating one accessor's
      // result cannot leak into the next reader.
      expect(IdValueObject.defaultValue).not.toBe(IdValueObject.defaultValue);
    });
  });

  describe('isEmpty and isDefault', () => {
    it('reports true for the empty identifier', () => {
      expect(IdValueObject.empty().isEmpty()).toBe(true);
    });

    it('reports false for a generated identifier', () => {
      expect(IdValueObject.create().isEmpty()).toBe(false);
    });

    it('recognises a nil UUID that arrived through load, not only through empty()', () => {
      // The check is on the value, not on which factory built the instance;
      // an id rehydrated from a database column must still read as empty.
      expect(IdValueObject.load(NIL_UUID).isEmpty()).toBe(true);
    });

    it('keeps isDefault as a strict alias of isEmpty', () => {
      const emptyId = IdValueObject.empty();
      const generated = IdValueObject.create();

      expect(emptyId.isDefault()).toBe(emptyId.isEmpty());
      expect(generated.isDefault()).toBe(generated.isEmpty());
    });
  });

  describe('equals', () => {
    it('treats two instances carrying the same UUID as equal', () => {
      // Identity is value-based: two reads of the same row must compare equal
      // even though they are different objects.
      const a = IdValueObject.load(V4_UUID);
      const b = IdValueObject.load(V4_UUID);

      expect(a).not.toBe(b);
      expect(a.equals(b)).toBe(true);
    });

    it('treats different UUIDs as different', () => {
      expect(IdValueObject.create().equals(IdValueObject.create())).toBe(false);
    });

    it('is symmetric', () => {
      const a = IdValueObject.load(V4_UUID);
      const b = IdValueObject.load(V4_UUID);
      const c = IdValueObject.create();

      expect(a.equals(b)).toBe(b.equals(a));
      expect(a.equals(c)).toBe(c.equals(a));
    });

    it.each([
      ['null', null],
      ['undefined', undefined],
      ['the raw UUID string', V4_UUID],
      ['a look-alike plain object', { value: V4_UUID }],
    ])('returns false when compared with %s', (_label, other) => {
      // equals() takes `unknown`, so it is routinely called with whatever the
      // caller has; it must answer false instead of throwing.
      expect(IdValueObject.load(V4_UUID).equals(other)).toBe(false);
    });

    it('returns false for a subclass instance holding the same UUID', () => {
      // Surprising but deliberate: the base compares prototypes, so a derived
      // id is never equal to a plain IdValueObject even with an identical
      // value. Anyone subclassing for a typed id (OrderId, CustomerId) gets
      // type-segregated equality, and mixing the two silently compares false.
      class TypedId extends IdValueObject {
        static of(value: string): TypedId {
          return new TypedId(value);
        }
      }

      const base = IdValueObject.load(V4_UUID);
      const derived = TypedId.of(V4_UUID);

      expect(derived.equals(base)).toBe(false);
      expect(base.equals(derived)).toBe(false);
    });

    it('gives equal identifiers equal hash codes', () => {
      // Only the equal-implies-same-hash direction is asserted. The inherited
      // hash is derived from the JSON length of the components, so every UUID
      // hashes identically; asserting distinct ids hash differently would be
      // asserting a bug that does not exist yet.
      const a = IdValueObject.load(V4_UUID);
      const b = IdValueObject.load(V4_UUID);

      expect(a.getHashCode()).toBe(b.getHashCode());
    });
  });

  describe('serialization', () => {
    it('renders the bare UUID from toString', () => {
      const id = IdValueObject.load(V4_UUID);

      expect(id.toString()).toBe(V4_UUID);
    });

    it('renders the bare UUID through string interpolation', () => {
      // Interpolation goes through toString; if the override were lost, ids
      // would land in logs and URLs as "[object Object]".
      expect(`${IdValueObject.load(V4_UUID)}`).toBe(V4_UUID);
    });

    it('serializes to a plain string inside JSON.stringify', () => {
      // toJSON is what keeps API payloads flat; without it the id would
      // serialize as its internal manager graph.
      const payload = JSON.stringify({ id: IdValueObject.load(V4_UUID) });

      expect(payload).toBe(`{"id":"${V4_UUID}"}`);
    });

    it('produces JSON that load can consume again', () => {
      const original = IdValueObject.create();
      const revived = IdValueObject.load(
        JSON.parse(JSON.stringify({ id: original })).id,
      );

      expect(revived.equals(original)).toBe(true);
    });
  });

  describe('validation surface', () => {
    it('reports a generated identifier as valid with no broken rules', () => {
      const id = IdValueObject.create();

      expect(id.isValid).toBe(true);
      expect(id.brokenRules.getBrokenRules()).toHaveLength(0);
    });

    it('reports the empty identifier as valid too', () => {
      // Worth stating explicitly: "empty" is a legitimate value, not a broken
      // rule. Callers must use isEmpty(), not isValid, to detect an absent id.
      expect(IdValueObject.empty().isValid).toBe(true);
    });

    it('keeps addValidators callable a second time without side effects', () => {
      // addValidators() is the template-method hook the base constructor calls.
      // A subclass that overrides it and re-runs it after its own fields are
      // assigned (the fix pattern used by NumberValueObject) must not trip over
      // this override, and re-running must not invent broken rules.
      const id = IdValueObject.create();

      expect(() => id.addValidators()).not.toThrow();
      expect(id.brokenRules.getBrokenRules()).toHaveLength(0);
      expect(id.isValid).toBe(true);
    });
  });

  describe('copying', () => {
    it('produces an equal but distinct instance', () => {
      const original = IdValueObject.create();
      const copy = original.getCopy();

      expect(copy).not.toBe(original);
      expect(copy.equals(original)).toBe(true);
    });

    it('keeps the copy usable as an identifier', () => {
      const original = IdValueObject.create();
      const copy = original.getCopy() as IdValueObject;

      expect(copy).toBeInstanceOf(IdValueObject);
      expect(copy.toString()).toBe(original.toString());
      expect(copy.isEmpty()).toBe(false);
    });

    it('exposes clone as an alias of getCopy', () => {
      const original = IdValueObject.load(V4_UUID);

      expect((original.clone() as IdValueObject).getValue()).toBe(V4_UUID);
    });
  });

  describe('setValue (the inherited mutation path)', () => {
    // Regression: setValue is public on DddValueObject and used to be
    // completely ungated here, so any holder of an id could overwrite it with
    // arbitrary text and the instance still reported isValid === true.
    it('rejects a non-UUID with InvalidFormatException', () => {
      const id = IdValueObject.create();

      expect(() => id.setValue('not-a-uuid')).toThrow(InvalidFormatException);
    });

    it('leaves the identifier untouched when the new value is rejected', () => {
      // Failing closed matters more here than anywhere else: the aggregate has
      // already been keyed by this value.
      const id = IdValueObject.create();
      const before = id.getValue();

      expect(() => id.setValue('not-a-uuid')).toThrow();
      expect(id.getValue()).toBe(before);
      expect(id.isValid).toBe(true);
    });

    it.each([
      ['null', null],
      ['undefined', undefined],
    ])('keeps rejecting %s with ArgumentNullException', (_label, value) => {
      // The base contract for setValue must survive the override.
      const id = IdValueObject.create();

      expect(() => id.setValue(value as unknown as string)).toThrow(
        ArgumentNullException,
      );
    });

    it.each([
      ['an empty string', ''],
      ['a dash-less UUID', V4_UUID.replace(/-/g, '')],
      ['a brace-wrapped UUID', `{${V4_UUID}}`],
      ['a UUID with trailing whitespace', `${V4_UUID} `],
      ['a truncated UUID', V4_UUID.slice(0, -1)],
    ])('rejects %s exactly as load does', (_label, value) => {
      const id = IdValueObject.create();

      expect(() => id.setValue(value as string)).toThrow(
        InvalidFormatException,
      );
    });

    it('accepts a valid UUID and applies it', () => {
      const id = IdValueObject.create();

      id.setValue(V4_UUID);

      expect(id.getValue()).toBe(V4_UUID);
      expect(id.isValid).toBe(true);
      expect(id.trackingState.isDirty).toBe(true);
    });
  });

  describe('constructor gate', () => {
    it('refuses to build a subclass instance around a non-UUID', () => {
      // The constructor is protected, not private: a typed id (OrderId,
      // CustomerId) reaches it directly, bypassing load(). The guard has to
      // live here, not in the factory.
      class TypedId extends IdValueObject {
        static of(value: string): TypedId {
          return new TypedId(value);
        }
      }

      expect(() => TypedId.of('not-a-uuid')).toThrow(InvalidFormatException);
      expect(() => TypedId.of(V4_UUID)).not.toThrow();
    });
  });

  describe('case canonicalization', () => {
    const UPPER_V4_UUID = V4_UUID.toUpperCase();

    it('stores an upper-case UUID in canonical lower case', () => {
      // RFC 4122 §3: UUIDs are case-insensitive on input, lower case on
      // output. Keeping the caller's casing produced two identities for one
      // identifier.
      expect(IdValueObject.load(UPPER_V4_UUID).getValue()).toBe(V4_UUID);
    });

    it('treats the two spellings as the same identity', () => {
      const upper = IdValueObject.load(UPPER_V4_UUID);
      const lower = IdValueObject.load(V4_UUID);

      expect(upper.equals(lower)).toBe(true);
      expect(lower.equals(upper)).toBe(true);
      expect(upper.getHashCode()).toBe(lower.getHashCode());
    });

    it('canonicalizes through setValue too', () => {
      const id = IdValueObject.create();

      id.setValue(UPPER_V4_UUID);

      expect(id.getValue()).toBe(V4_UUID);
    });

    it('serializes in canonical form', () => {
      const id = IdValueObject.load(UPPER_V4_UUID);

      expect(id.toString()).toBe(V4_UUID);
      expect(id.toJSON()).toBe(V4_UUID);
    });

    it('still rejects a mixed-case string that is not a UUID', () => {
      // Canonicalization must not be mistaken for repair.
      expect(() => IdValueObject.load('NOT-A-UUID')).toThrow(
        InvalidFormatException,
      );
    });
  });

  describe('accepted UUID versions', () => {
    // Decision pinned here: load() accepts any RFC 4122 version, because it
    // rehydrates identifiers this library did not necessarily mint (and
    // because empty() is the nil UUID, which is not a v4). Only create()
    // promises v4. The error message was the half that was wrong.
    it.each([
      ['a v1 UUID', '2c5ea4c0-4067-11e9-8bad-9b1deb4d3b7d'],
      ['a v3 UUID', 'a3bb189e-8bf9-3888-9912-ace4e6543002'],
      ['the nil UUID', NIL_UUID],
    ])('accepts %s', (_label, value) => {
      expect(IdValueObject.load(value).getValue()).toBe(value);
    });

    it('does not promise UUID v4 in the rejection message', () => {
      const message = (() => {
        try {
          IdValueObject.load('not-a-uuid');
          return '';
        } catch (error) {
          return (error as Error).message;
        }
      })();

      expect(message).toContain('a valid UUID');
      expect(message).not.toContain('v4');
    });
  });

  describe('UUID invariant as a validation rule', () => {
    it('registers the UUID validator on every instance', () => {
      // addValidators() used to register nothing at all, which is what left
      // isValid unable to notice a corrupted identifier.
      expect(
        IdValueObject.create().validatorRules.has(UuidFormatValidator),
      ).toBe(true);
    });

    it('reports isValid === false when the value is corrupted behind the gates', () => {
      // setValuePropertyChanged is protected, so a subclass -- or an ORM
      // rehydrating state -- can reach the value without going through
      // setValue(). isValid must answer honestly rather than report true for
      // an identifier holding arbitrary text.
      const id = IdValueObject.create();

      (
        id as unknown as {
          setValuePropertyChanged(value: string, name: string): void;
        }
      ).setValuePropertyChanged('not-a-uuid', 'internalValue');

      expect(id.getValue()).toBe('not-a-uuid');
      expect(id.isValid).toBe(false);
      expect(id.brokenRules.getBrokenRules()[0].message).toContain(
        'not-a-uuid',
      );
    });

    it('carries the rule over to a copy', () => {
      // getCopy() rebuilds validators against the copy; the invariant must
      // survive that rebuild.
      const copy = IdValueObject.create().getCopy() as IdValueObject;

      expect(copy.validatorRules.has(UuidFormatValidator)).toBe(true);
      expect(copy.isValid).toBe(true);
      expect(() => copy.setValue('not-a-uuid')).toThrow(InvalidFormatException);
    });
  });

  describe('getHashCode', () => {
    it('gives different identifiers different hash codes', () => {
      // The inherited hash is the JSON length of the components, i.e. 38 for
      // every UUID: every id collided, and any hash-bucketed structure keyed
      // by ids degenerated to one bucket.
      const a = IdValueObject.load(V4_UUID);
      const b = IdValueObject.load('2c5ea4c0-4067-11e9-8bad-9b1deb4d3b7d');

      expect(a.getHashCode()).not.toBe(b.getHashCode());
    });

    it('spreads a large set of generated identifiers across distinct hashes', () => {
      const hashes = new Set(
        Array.from({ length: 500 }, () => IdValueObject.create().getHashCode()),
      );

      // Not a claim of perfection -- a 32-bit hash may collide -- but a
      // constant hash would collapse this to 1.
      expect(hashes.size).toBeGreaterThan(495);
    });

    it('stays a 32-bit integer', () => {
      const hash = IdValueObject.create().getHashCode();

      expect(Number.isInteger(hash)).toBe(true);
      expect(Math.abs(hash)).toBeLessThanOrEqual(2 ** 31);
    });

    it('is stable for the same value across instances and copies', () => {
      const original = IdValueObject.load(V4_UUID);

      expect(IdValueObject.load(V4_UUID).getHashCode()).toBe(
        original.getHashCode(),
      );
      expect((original.getCopy() as IdValueObject).getHashCode()).toBe(
        original.getHashCode(),
      );
    });
  });
});
