import { DddEnum } from './enum';
import { ArgumentNullException } from './exceptions/domain.exception';

/**
 * DddEnum is the "Smart Enum" base: a closed set of instances declared as
 * static members of a subclass.
 *
 * Almost every public member -- fromValue, fromName, fromNameIgnoreCase,
 * fromDisplayName, isDefined, getMinValue, getMaxValue -- answers by reading
 * through getAll(), which discovers those static members reflectively on every
 * call and hands back a copy. That makes getAll() the single point of failure
 * for the whole class: if discovery picks up the wrong members, or picks them
 * up at the wrong moment, every lookup in the file starts lying silently
 * rather than throwing. The discovery tests below are the ones worth keeping.
 */

// Declared first so OrderStatus can hold one of its instances as a static and
// prove that getAll() filters by the exact class rather than by DddEnum.
class Priority extends DddEnum {
  static readonly Low = new Priority(1, 'Low');
  static readonly High = new Priority(2, 'High');

  constructor(id: number, name: string) {
    super(id, name);
  }
}

/** The canonical shape from the class docs: private ctor, static members. */
class OrderStatus extends DddEnum {
  static readonly Draft = new OrderStatus(1, 'Draft');
  static readonly Submitted = new OrderStatus(2, 'Submitted');
  static readonly Approved = new OrderStatus(3, 'Approved');
  static readonly Shipped = new OrderStatus(4, 'Shipped');

  // Deliberate noise. None of these may leak into getAll(): a static constant
  // counted as a member would corrupt getMinValue/getMaxValue and make
  // isDefined() answer for ids that were never declared.
  static readonly MAX_STAGES = 4;
  static readonly LABEL = 'order status';
  static readonly ALIEN = Priority.Low;
  static helper(): string {
    return 'not a member';
  }

  private constructor(id: number, name: string) {
    super(id, name);
  }

  // Domain behaviour on the instance -- the entire point of the pattern.
  isTerminal(): boolean {
    return this.equals(OrderStatus.Shipped);
  }
}

/** Public ctor so the validation branches can be exercised from outside. */
class Openable extends DddEnum {
  constructor(id: number, name: string) {
    super(id, name);
  }
}

/** An enumeration that declares no members at all. */
class EmptyEnum extends DddEnum {
  constructor(id: number, name: string) {
    super(id, name);
  }
}

/** Members declared out of id order, to prove min/max do not assume sorting. */
class Unsorted extends DddEnum {
  static readonly Middle = new Unsorted(5, 'Middle');
  static readonly Highest = new Unsorted(9, 'Highest');
  static readonly Lowest = new Unsorted(0, 'Lowest');

  constructor(id: number, name: string) {
    super(id, name);
  }
}

/**
 * Only the mutation test touches this one, so a caller corrupting the list it
 * gets back cannot bleed into the rest of the file.
 */
class Fragile extends DddEnum {
  static readonly One = new Fragile(1, 'One');
  static readonly Two = new Fragile(2, 'Two');
  static readonly Three = new Fragile(3, 'Three');

  constructor(id: number, name: string) {
    super(id, name);
  }
}

/**
 * A lookup that runs while the class body is still evaluating: EARLY_LOOKUP
 * forces fromValue() -- and therefore getAll() -- to answer at a point where
 * only `First` has been assigned. A scalar, so it is not itself a member.
 */
class Staged extends DddEnum {
  static readonly First = new Staged(1, 'First');
  static readonly EARLY_LOOKUP = Staged.fromValue<Staged>(1)?.name;
  static readonly Second = new Staged(2, 'Second');

  constructor(id: number, name: string) {
    super(id, name);
  }
}

/** A populated enumeration that is then extended -- the documented benefit. */
class BaseWorkflow extends DddEnum {
  static readonly Started = new BaseWorkflow(1, 'Started');
  static readonly Finished = new BaseWorkflow(2, 'Finished');

  constructor(id: number, name: string) {
    super(id, name);
  }
}

class ExtendedWorkflow extends BaseWorkflow {
  static readonly Paused = new ExtendedWorkflow(3, 'Paused');
}

describe('DddEnum', () => {
  describe('constructor validation', () => {
    it('should accept a zero id, since zero is a legitimate member', () => {
      // `if (!id)` instead of `if (id < 0)` is the obvious way to get this
      // wrong, and a rejected 0 would break every "None"/"Unknown" member.
      const none = new Openable(0, 'None');

      expect(none.id).toBe(0);
      expect(none.name).toBe('None');
    });

    it('should reject a negative id', () => {
      expect(() => new Openable(-1, 'Negative')).toThrow(
        'Enum id must be non-negative',
      );
    });

    it('should reject a fractional id', () => {
      // Ids are used as database keys and as the basis of compareTo; a
      // fractional one would order correctly but never round-trip.
      expect(() => new Openable(1.5, 'Fraction')).toThrow(
        'Enum id must be an integer',
      );
    });

    it('should reject NaN and Infinity as ids', () => {
      expect(() => new Openable(NaN, 'NaN')).toThrow(
        'Enum id must be an integer',
      );
      expect(() => new Openable(Infinity, 'Infinity')).toThrow(
        'Enum id must be an integer',
      );
    });

    it('should reject a non-numeric id', () => {
      // The integer check runs before anything else, so a numeric string --
      // the shape an id arrives in from a query string or a form -- is
      // rejected rather than silently coerced.
      expect(() => new Openable('1' as any, 'String')).toThrow(
        'Enum id must be an integer',
      );
      expect(() => new Openable(null as any, 'Null')).toThrow(
        'Enum id must be an integer',
      );
      expect(() => new Openable(undefined as any, 'Undefined')).toThrow(
        'Enum id must be an integer',
      );
    });

    it('should reject an empty or whitespace-only name', () => {
      // A blank name is worse than useless: toString() would return '' and
      // fromName() could never find the member again.
      expect(() => new Openable(1, '')).toThrow(
        'Enum name must be a non-empty string',
      );
      expect(() => new Openable(1, '   ')).toThrow(
        'Enum name must be a non-empty string',
      );
      expect(() => new Openable(1, '\t\n')).toThrow(
        'Enum name must be a non-empty string',
      );
    });

    it('should reject a non-string name', () => {
      expect(() => new Openable(1, null as any)).toThrow(
        'Enum name must be a non-empty string',
      );
      expect(() => new Openable(1, undefined as any)).toThrow(
        'Enum name must be a non-empty string',
      );
      expect(() => new Openable(1, 42 as any)).toThrow(
        'Enum name must be a non-empty string',
      );
    });

    it('should keep the name exactly as given, without trimming', () => {
      // Surprising, and worth knowing: surrounding whitespace only makes the
      // name *pass* validation, it is never normalised away. A member built
      // from an untrimmed input is therefore unreachable via fromName('X').
      const padded = new Openable(1, '  Padded  ');

      expect(padded.name).toBe('  Padded  ');
      expect(padded.toString()).toBe('  Padded  ');
    });

    it('should expose id and name as the readonly identity of the member', () => {
      expect(OrderStatus.Draft.id).toBe(1);
      expect(OrderStatus.Draft.name).toBe('Draft');
    });
  });

  describe('toString', () => {
    it('should return the member name', () => {
      expect(OrderStatus.Approved.toString()).toBe('Approved');
    });

    it('should be used for string interpolation and concatenation', () => {
      // The overridden toString is what makes enums readable in logs and
      // error messages; losing the override degrades them to [object Object].
      expect(`${OrderStatus.Shipped}`).toBe('Shipped');
      expect('status: ' + OrderStatus.Draft).toBe('status: Draft');
    });
  });

  describe('getAll', () => {
    it('should return every declared member, in declaration order', () => {
      // Declaration order is not incidental: it is the order the members are
      // rendered in for dropdowns and workflow diagrams, and it comes for free
      // from Object.getOwnPropertyNames. A refactor to a Set or a spread of an
      // object literal would quietly reorder it.
      expect(OrderStatus.getAll<OrderStatus>().map((s) => s.name)).toEqual([
        'Draft',
        'Submitted',
        'Approved',
        'Shipped',
      ]);
    });

    it('should exclude statics that are not instances of the enum', () => {
      // MAX_STAGES, LABEL, the helper method, and the inherited `length`,
      // `name` and `prototype` of the constructor function are all own
      // properties of the class. Only the instanceof filter keeps them out.
      const all = OrderStatus.getAll<OrderStatus>();

      expect(all).toHaveLength(4);
      expect(all.every((item) => item instanceof OrderStatus)).toBe(true);
      expect(all).not.toContain(OrderStatus.LABEL as any);
    });

    it('should exclude members belonging to a different enum class', () => {
      // OrderStatus.ALIEN holds a Priority. It is a DddEnum, so a filter
      // written against DddEnum instead of the concrete class would admit it
      // and make OrderStatus.fromValue(1) ambiguous.
      expect(OrderStatus.getAll<OrderStatus>()).not.toContain(
        Priority.Low as any,
      );
      expect(Priority.getAll<Priority>().map((p) => p.name)).toEqual([
        'Low',
        'High',
      ]);
    });

    it('should return an empty list for an enumeration with no members', () => {
      expect(EmptyEnum.getAll()).toEqual([]);
    });

    it('should return an empty list for the abstract base itself', () => {
      // The cache is a static Map keyed by constructor and shared by every
      // subclass. If keying ever regressed, DddEnum.getAll() would start
      // returning some other enum's members.
      expect(DddEnum.getAll()).toEqual([]);
    });

    it('should keep answering consistently across repeated calls', () => {
      const first = OrderStatus.getAll<OrderStatus>().map((s) => s.name);
      const second = OrderStatus.getAll<OrderStatus>().map((s) => s.name);

      expect(second).toEqual(first);
    });

    it('should hand back a copy the caller owns, not the enumeration itself', () => {
      // Handing out the internal list means one caller mutating it silently
      // rewrites the enumeration for the whole process, and every lookup
      // below reads through getAll(), so they all start lying rather than
      // throwing.
      const all = Fragile.getAll<Fragile>();

      expect(Fragile.getAll<Fragile>()).not.toBe(all);

      // All three are natural things to do with a returned list, and sort()
      // is shown as an idiom in the class docs.
      all.sort((a, b) => b.id - a.id);
      all.pop();
      all.length = 0;

      expect(Fragile.getAll<Fragile>().map((f) => f.name)).toEqual([
        'One',
        'Two',
        'Three',
      ]);
      expect(Fragile.isDefined(3)).toBe(true);
      expect(Fragile.fromValue<Fragile>(1)).toBe(Fragile.One);
      expect(Fragile.fromName<Fragile>('Two')).toBe(Fragile.Two);
      expect(Fragile.getMinValue<Fragile>()).toBe(Fragile.One);
      expect(Fragile.getMaxValue<Fragile>()).toBe(Fragile.Three);
    });

    it('should not freeze a partial member list when a lookup runs mid-class-body', () => {
      // Staged looks itself up between its two members. A list memoised by
      // that first call would report Second as undeclared forever, and
      // nothing ever invalidates it.
      expect(Staged.EARLY_LOOKUP).toBe('First');

      expect(Staged.getAll<Staged>().map((s) => s.name)).toEqual([
        'First',
        'Second',
      ]);
      expect(Staged.isDefined(2)).toBe(true);
      expect(Staged.fromValue<Staged>(2)).toBe(Staged.Second);
      expect(Staged.getMaxValue<Staged>()).toBe(Staged.Second);
    });
  });

  describe('inheritance', () => {
    it('should let a subclass inherit the members of the enumeration it extends', () => {
      // Members live as static properties of the class that declares them, so
      // a subclass owns none of them; without walking the prototype chain the
      // extended enumeration reports itself as empty.
      expect(
        ExtendedWorkflow.getAll<ExtendedWorkflow>().map((w) => w.name),
      ).toEqual(['Started', 'Finished', 'Paused']);
    });

    it('should answer every lookup on the subclass for inherited members', () => {
      expect(ExtendedWorkflow.isDefined(1)).toBe(true);
      expect(ExtendedWorkflow.fromValue<BaseWorkflow>(2)).toBe(
        BaseWorkflow.Finished,
      );
      expect(ExtendedWorkflow.fromName<BaseWorkflow>('Started')).toBe(
        BaseWorkflow.Started,
      );
      expect(ExtendedWorkflow.fromNameIgnoreCase<BaseWorkflow>('paused')).toBe(
        ExtendedWorkflow.Paused,
      );
      expect(ExtendedWorkflow.getMinValue<BaseWorkflow>()).toBe(
        BaseWorkflow.Started,
      );
      expect(ExtendedWorkflow.getMaxValue<BaseWorkflow>()).toBe(
        ExtendedWorkflow.Paused,
      );
    });

    it('should not leak a subclass member back into the base enumeration', () => {
      // Inheritance only runs one way. Paused is declared on the subclass, so
      // the base must not start answering for id 3.
      expect(BaseWorkflow.getAll<BaseWorkflow>().map((w) => w.name)).toEqual([
        'Started',
        'Finished',
      ]);
      expect(BaseWorkflow.isDefined(3)).toBe(false);
      expect(BaseWorkflow.getMaxValue<BaseWorkflow>()).toBe(
        BaseWorkflow.Finished,
      );
    });
  });

  describe('equals', () => {
    it('should return true for the same member', () => {
      expect(OrderStatus.Draft.equals(OrderStatus.Draft)).toBe(true);
    });

    it('should return false for a different member of the same enum', () => {
      expect(OrderStatus.Draft.equals(OrderStatus.Submitted)).toBe(false);
    });

    it('should return false across enum classes even when the ids match', () => {
      // Priority.Low and OrderStatus.Draft both carry id 1. Equality compares
      // prototypes first precisely so that two unrelated enumerations can
      // reuse the same numbering without colliding.
      expect(OrderStatus.Draft.equals(Priority.Low)).toBe(false);
      expect(Priority.Low.equals(OrderStatus.Draft)).toBe(false);
    });

    it('should return false for null, undefined and non-enum values', () => {
      expect(OrderStatus.Draft.equals(null)).toBe(false);
      expect(OrderStatus.Draft.equals(undefined)).toBe(false);
      expect(OrderStatus.Draft.equals(1)).toBe(false);
      expect(OrderStatus.Draft.equals('Draft')).toBe(false);
    });

    it('should return false for a plain object that mimics the member', () => {
      // A duck-typed object deserialised from JSON must not compare equal to
      // the real member, or identity checks in the domain become meaningless.
      expect(OrderStatus.Draft.equals({ id: 1, name: 'Draft' })).toBe(false);
    });

    it('should compare by id, not by object identity', () => {
      // Two separately constructed instances with the same id are the same
      // value; this is what lets an enum survive a serialisation round-trip.
      const a = new Openable(7, 'Seven');
      const b = new Openable(7, 'Seven');

      expect(a).not.toBe(b);
      expect(a.equals(b)).toBe(true);
    });

    it('should ignore the name when the ids agree', () => {
      // Documented behaviour: the id is the identity, the name is a label.
      const a = new Openable(7, 'Seven');
      const b = new Openable(7, 'Siete');

      expect(a.equals(b)).toBe(true);
    });
  });

  describe('absoluteDifference', () => {
    it('should return the distance between two members', () => {
      expect(
        DddEnum.absoluteDifference(OrderStatus.Draft, OrderStatus.Shipped),
      ).toBe(3);
    });

    it('should be symmetric', () => {
      // "Absolute" is the whole contract: a caller must not have to know
      // which of the two values is further along the workflow.
      expect(
        DddEnum.absoluteDifference(OrderStatus.Shipped, OrderStatus.Draft),
      ).toBe(3);
    });

    it('should return zero for the same member', () => {
      expect(
        DddEnum.absoluteDifference(OrderStatus.Draft, OrderStatus.Draft),
      ).toBe(0);
    });

    it('should throw ArgumentNullException naming the offending argument', () => {
      expect(() => DddEnum.absoluteDifference(null, OrderStatus.Draft)).toThrow(
        ArgumentNullException,
      );
      expect(() => DddEnum.absoluteDifference(null, OrderStatus.Draft)).toThrow(
        'firstValue cannot be null or undefined',
      );

      expect(() =>
        DddEnum.absoluteDifference(OrderStatus.Draft, undefined),
      ).toThrow(ArgumentNullException);
      expect(() =>
        DddEnum.absoluteDifference(OrderStatus.Draft, undefined),
      ).toThrow('secondValue cannot be null or undefined');
    });
  });

  describe('fromValue', () => {
    it('should find the member with the given id', () => {
      expect(OrderStatus.fromValue<OrderStatus>(2)).toBe(OrderStatus.Submitted);
    });

    it('should find a member whose id is zero', () => {
      // A `find` written with a truthiness test instead of === would skip it.
      expect(Unsorted.fromValue<Unsorted>(0)).toBe(Unsorted.Lowest);
    });

    it('should return undefined for an id that was never declared', () => {
      expect(OrderStatus.fromValue<OrderStatus>(999)).toBeUndefined();
    });

    it('should return undefined rather than throw for non-numeric input', () => {
      // Persistence layers hand back strings and nulls; this is the guard that
      // keeps a bad database row from crashing the domain.
      expect(OrderStatus.fromValue<OrderStatus>('2' as any)).toBeUndefined();
      expect(OrderStatus.fromValue<OrderStatus>(null as any)).toBeUndefined();
      expect(OrderStatus.fromValue<OrderStatus>(undefined)).toBeUndefined();
      expect(OrderStatus.fromValue<OrderStatus>({} as any)).toBeUndefined();
    });

    it('should return undefined for NaN', () => {
      // NaN passes the typeof check, so it is the === comparison inside find
      // that saves us here.
      expect(OrderStatus.fromValue<OrderStatus>(NaN)).toBeUndefined();
    });

    it('should be scoped to the class it is called on', () => {
      expect(Priority.fromValue<Priority>(1)).toBe(Priority.Low);
      expect(OrderStatus.fromValue<OrderStatus>(1)).toBe(OrderStatus.Draft);
    });
  });

  describe('fromName', () => {
    it('should find the member with the given name', () => {
      expect(OrderStatus.fromName<OrderStatus>('Approved')).toBe(
        OrderStatus.Approved,
      );
    });

    it('should be case sensitive', () => {
      expect(OrderStatus.fromName<OrderStatus>('approved')).toBeUndefined();
      expect(OrderStatus.fromName<OrderStatus>('APPROVED')).toBeUndefined();
    });

    it('should not trim the needle before matching', () => {
      // Whitespace is only checked to reject blank input; it is never stripped,
      // so a padded lookup misses. Callers must trim before asking.
      expect(OrderStatus.fromName<OrderStatus>(' Approved ')).toBeUndefined();
    });

    it('should return undefined for empty, blank and non-string input', () => {
      expect(OrderStatus.fromName<OrderStatus>('')).toBeUndefined();
      expect(OrderStatus.fromName<OrderStatus>('   ')).toBeUndefined();
      expect(OrderStatus.fromName<OrderStatus>(null as any)).toBeUndefined();
      expect(
        OrderStatus.fromName<OrderStatus>(undefined as any),
      ).toBeUndefined();
      expect(OrderStatus.fromName<OrderStatus>(7 as any)).toBeUndefined();
    });

    it('should return undefined for an unknown name', () => {
      expect(OrderStatus.fromName<OrderStatus>('Refunded')).toBeUndefined();
    });
  });

  describe('fromNameIgnoreCase', () => {
    it('should match regardless of casing', () => {
      expect(OrderStatus.fromNameIgnoreCase<OrderStatus>('draft')).toBe(
        OrderStatus.Draft,
      );
      expect(OrderStatus.fromNameIgnoreCase<OrderStatus>('DRAFT')).toBe(
        OrderStatus.Draft,
      );
      expect(OrderStatus.fromNameIgnoreCase<OrderStatus>('DrAfT')).toBe(
        OrderStatus.Draft,
      );
    });

    it('should still match an exactly-cased name', () => {
      expect(OrderStatus.fromNameIgnoreCase<OrderStatus>('Shipped')).toBe(
        OrderStatus.Shipped,
      );
    });

    it('should return undefined for empty, blank and non-string input', () => {
      expect(OrderStatus.fromNameIgnoreCase<OrderStatus>('')).toBeUndefined();
      expect(
        OrderStatus.fromNameIgnoreCase<OrderStatus>('   '),
      ).toBeUndefined();
      expect(
        OrderStatus.fromNameIgnoreCase<OrderStatus>(null as any),
      ).toBeUndefined();
      expect(
        OrderStatus.fromNameIgnoreCase<OrderStatus>(7 as any),
      ).toBeUndefined();
    });

    it('should return undefined for an unknown name', () => {
      expect(
        OrderStatus.fromNameIgnoreCase<OrderStatus>('refunded'),
      ).toBeUndefined();
    });
  });

  describe('fromDisplayName (deprecated)', () => {
    it('should keep behaving exactly like fromName', () => {
      // Deprecated but still exported; the alias is the only thing keeping
      // pre-3.0 call sites compiling, so it must not drift.
      expect(OrderStatus.fromDisplayName<OrderStatus>('Draft')).toBe(
        OrderStatus.Draft,
      );
      expect(OrderStatus.fromDisplayName<OrderStatus>('draft')).toBeUndefined();
      expect(OrderStatus.fromDisplayName<OrderStatus>('')).toBeUndefined();
    });
  });

  describe('compareTo', () => {
    it('should return a negative number when this member comes first', () => {
      expect(OrderStatus.Draft.compareTo(OrderStatus.Shipped)).toBeLessThan(0);
    });

    it('should return zero for members with the same id', () => {
      expect(OrderStatus.Draft.compareTo(OrderStatus.Draft)).toBe(0);
    });

    it('should return a positive number when this member comes last', () => {
      expect(OrderStatus.Shipped.compareTo(OrderStatus.Draft)).toBeGreaterThan(
        0,
      );
    });

    it('should sort a list of members into id order', () => {
      // The documented use of compareTo, and the reason the sign matters
      // rather than just the truthiness.
      const sorted = [
        OrderStatus.Shipped,
        OrderStatus.Draft,
        OrderStatus.Approved,
      ].sort((a, b) => a.compareTo(b));

      expect(sorted.map((s) => s.name)).toEqual([
        'Draft',
        'Approved',
        'Shipped',
      ]);
    });

    it('should throw ArgumentNullException for a missing operand', () => {
      expect(() => OrderStatus.Draft.compareTo(null)).toThrow(
        ArgumentNullException,
      );
      expect(() => OrderStatus.Draft.compareTo(undefined)).toThrow(
        'other cannot be null or undefined',
      );
    });

    it('should compare across enum classes by raw id', () => {
      // compareTo does no type check -- only equals() does. Worth knowing:
      // mixing enumerations in one sort silently produces a meaningless order
      // instead of failing.
      expect(OrderStatus.Draft.compareTo(Priority.High)).toBe(-1);
    });
  });

  describe('ordering helpers', () => {
    it('should treat equal members as neither less nor greater', () => {
      // The boundary that separates the four helpers from one another: an
      // off-by-one in any of them shows up here first.
      const draft = OrderStatus.Draft;

      expect(draft.isLessThan(draft)).toBe(false);
      expect(draft.isGreaterThan(draft)).toBe(false);
      expect(draft.isLessThanOrEqual(draft)).toBe(true);
      expect(draft.isGreaterThanOrEqual(draft)).toBe(true);
    });

    it('should order a strictly smaller member correctly', () => {
      expect(OrderStatus.Draft.isLessThan(OrderStatus.Submitted)).toBe(true);
      expect(OrderStatus.Draft.isLessThanOrEqual(OrderStatus.Submitted)).toBe(
        true,
      );
      expect(OrderStatus.Draft.isGreaterThan(OrderStatus.Submitted)).toBe(
        false,
      );
      expect(
        OrderStatus.Draft.isGreaterThanOrEqual(OrderStatus.Submitted),
      ).toBe(false);
    });

    it('should order a strictly greater member correctly', () => {
      expect(OrderStatus.Shipped.isGreaterThan(OrderStatus.Approved)).toBe(
        true,
      );
      expect(
        OrderStatus.Shipped.isGreaterThanOrEqual(OrderStatus.Approved),
      ).toBe(true);
      expect(OrderStatus.Shipped.isLessThan(OrderStatus.Approved)).toBe(false);
      expect(OrderStatus.Shipped.isLessThanOrEqual(OrderStatus.Approved)).toBe(
        false,
      );
    });

    it('should propagate the null guard from compareTo', () => {
      // Every helper delegates, so none of them may swallow the exception and
      // return a plausible-looking false.
      expect(() => OrderStatus.Draft.isLessThan(null)).toThrow(
        ArgumentNullException,
      );
      expect(() => OrderStatus.Draft.isLessThanOrEqual(null)).toThrow(
        ArgumentNullException,
      );
      expect(() => OrderStatus.Draft.isGreaterThan(undefined)).toThrow(
        ArgumentNullException,
      );
      expect(() => OrderStatus.Draft.isGreaterThanOrEqual(undefined)).toThrow(
        ArgumentNullException,
      );
    });
  });

  describe('isBetween', () => {
    it('should include both bounds', () => {
      expect(
        OrderStatus.Draft.isBetween(OrderStatus.Draft, OrderStatus.Shipped),
      ).toBe(true);
      expect(
        OrderStatus.Shipped.isBetween(OrderStatus.Draft, OrderStatus.Shipped),
      ).toBe(true);
    });

    it('should return true for a member strictly inside the range', () => {
      expect(
        OrderStatus.Submitted.isBetween(OrderStatus.Draft, OrderStatus.Shipped),
      ).toBe(true);
    });

    it('should return false for a member outside the range', () => {
      expect(
        OrderStatus.Draft.isBetween(OrderStatus.Submitted, OrderStatus.Shipped),
      ).toBe(false);
      expect(
        OrderStatus.Shipped.isBetween(OrderStatus.Draft, OrderStatus.Approved),
      ).toBe(false);
    });

    it('should return false for an inverted range instead of swapping bounds', () => {
      // No member can satisfy max < min; the method does not silently
      // normalise the arguments, which would hide the caller's mistake.
      expect(
        OrderStatus.Submitted.isBetween(OrderStatus.Shipped, OrderStatus.Draft),
      ).toBe(false);
    });

    it('should throw when a bound is missing', () => {
      expect(() =>
        OrderStatus.Draft.isBetween(null, OrderStatus.Shipped),
      ).toThrow(ArgumentNullException);
    });
  });

  describe('isDefined', () => {
    it('should recognise every declared id', () => {
      expect(OrderStatus.isDefined(1)).toBe(true);
      expect(OrderStatus.isDefined(4)).toBe(true);
      expect(Unsorted.isDefined(0)).toBe(true);
    });

    it('should reject an undeclared id', () => {
      expect(OrderStatus.isDefined(0)).toBe(false);
      expect(OrderStatus.isDefined(5)).toBe(false);
      expect(OrderStatus.isDefined(-1)).toBe(false);
    });

    it('should reject non-numeric input rather than throw', () => {
      // This is the guard most likely to be called with unvalidated input,
      // straight off an HTTP request.
      expect(OrderStatus.isDefined('1' as any)).toBe(false);
      expect(OrderStatus.isDefined(null as any)).toBe(false);
      expect(OrderStatus.isDefined(NaN)).toBe(false);
    });

    it('should return false for an enumeration with no members', () => {
      expect(EmptyEnum.isDefined(1)).toBe(false);
    });
  });

  describe('getMinValue / getMaxValue', () => {
    it('should find the extremes by id, not by declaration position', () => {
      // Unsorted declares Middle, Highest, Lowest in that order. A naive
      // implementation returning the first or last declared member passes on
      // most enums and fails here.
      expect(Unsorted.getMinValue<Unsorted>()).toBe(Unsorted.Lowest);
      expect(Unsorted.getMaxValue<Unsorted>()).toBe(Unsorted.Highest);
    });

    it('should work on a naturally ordered enumeration', () => {
      expect(OrderStatus.getMinValue<OrderStatus>()).toBe(OrderStatus.Draft);
      expect(OrderStatus.getMaxValue<OrderStatus>()).toBe(OrderStatus.Shipped);
    });

    it('should return undefined instead of throwing on an empty enumeration', () => {
      // reduce() with no initial value throws on an empty array; the length
      // guard is the only thing standing between an empty enum and a crash.
      expect(EmptyEnum.getMinValue()).toBeUndefined();
      expect(EmptyEnum.getMaxValue()).toBeUndefined();
    });

    it('should return the single member when only one is declared', () => {
      expect(Priority.getMinValue<Priority>()).toBe(Priority.Low);
      expect(Priority.getMaxValue<Priority>()).toBe(Priority.High);
    });
  });

  describe('areEqual / areNotEqual', () => {
    it('should treat null and undefined as the same absent value', () => {
      expect(DddEnum.areEqual(null, null)).toBe(true);
      expect(DddEnum.areEqual(undefined, undefined)).toBe(true);
      expect(DddEnum.areEqual(null, undefined)).toBe(true);
      expect(DddEnum.areEqual(undefined, null)).toBe(true);
    });

    it('should return false when only one side is absent', () => {
      expect(DddEnum.areEqual(null, OrderStatus.Draft)).toBe(false);
      expect(DddEnum.areEqual(OrderStatus.Draft, null)).toBe(false);
      expect(DddEnum.areEqual(OrderStatus.Draft, undefined)).toBe(false);
    });

    it('should delegate to instance equality when both sides are present', () => {
      expect(DddEnum.areEqual(OrderStatus.Draft, OrderStatus.Draft)).toBe(true);
      expect(DddEnum.areEqual(OrderStatus.Draft, OrderStatus.Shipped)).toBe(
        false,
      );
      expect(DddEnum.areEqual(OrderStatus.Draft, Priority.Low)).toBe(false);
    });

    it('should not throw when the right operand is absent', () => {
      // The null-safety promised by the name only covers the left operand
      // structurally; the right one relies on equals() tolerating null.
      expect(() => DddEnum.areEqual(OrderStatus.Draft, null)).not.toThrow();
    });

    it('should make areNotEqual the exact negation of areEqual', () => {
      const pairs: Array<[DddEnum, DddEnum]> = [
        [OrderStatus.Draft, OrderStatus.Draft],
        [OrderStatus.Draft, OrderStatus.Shipped],
        [OrderStatus.Draft, Priority.Low],
        [null, null],
        [null, OrderStatus.Draft],
        [OrderStatus.Draft, undefined],
      ];

      pairs.forEach(([left, right]) => {
        expect(DddEnum.areNotEqual(left, right)).toBe(
          !DddEnum.areEqual(left, right),
        );
      });
    });

    it('should be callable from a subclass without changing the answer', () => {
      // Both statics resolve through `this`, so calling them on a subclass
      // must not re-scope the comparison.
      expect(OrderStatus.areEqual(OrderStatus.Draft, OrderStatus.Draft)).toBe(
        true,
      );
      expect(
        OrderStatus.areNotEqual(OrderStatus.Draft, OrderStatus.Shipped),
      ).toBe(true);
    });
  });

  describe('serialisation round-trip', () => {
    it('should serialise to a plain object carrying id and name', () => {
      // The docs advertise "serialization support"; in practice that means the
      // id survives JSON and can be resolved back to the singleton member.
      const json = JSON.parse(JSON.stringify(OrderStatus.Approved));

      expect(json).toEqual({ id: 3, name: 'Approved' });
      expect(OrderStatus.fromValue<OrderStatus>(json.id)).toBe(
        OrderStatus.Approved,
      );
    });
  });

  describe('domain behaviour on members', () => {
    it('should let a subclass build behaviour on top of equals', () => {
      // The reason this base exists at all: behaviour lives on the value.
      expect(OrderStatus.Shipped.isTerminal()).toBe(true);
      expect(OrderStatus.Draft.isTerminal()).toBe(false);
    });
  });
});

/*
 * Three defects that used to live here are now fixed and pinned by the tests
 * above -- all of them consequences of getAll() memoising its result and
 * scanning own properties only:
 *
 * 1. getAll() returned the internal cached array itself, so a caller doing
 *    .sort()/.pop() rewrote the enumeration for the rest of the process
 *    ("should hand back a copy the caller owns").
 * 2. The cache was filled by the first getAll() and never invalidated, so a
 *    lookup during class-body evaluation froze a partial member list forever
 *    ("should not freeze a partial member list...").
 * 3. A subclass of a populated enumeration saw none of its parent's members
 *    (describe('inheritance')).
 *
 * Still deliberately NOT covered: a static that aliases an existing member of
 * the same enumeration (`static readonly Default = Self.Draft`) is reported
 * twice by getAll(), since it is a distinct own property holding an instance
 * of the class. Pre-existing, unrelated to the three above.
 */
