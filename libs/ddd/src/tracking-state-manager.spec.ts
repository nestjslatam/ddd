import { TrackingStateManager } from './tracking-state-manager';
import {
  IChangeDetector,
  IProps,
  ITrackingStateManager,
} from './core/tracking-state';
import { DddValueObject } from './valueobject';

/**
 * TrackingStateManager is the unit-of-work state of every aggregate and value
 * object in this library: repositories branch on `isNew` / `isDirty` to decide
 * insert vs update vs skip. Two properties have to hold or persistence silently
 * does the wrong thing:
 *
 *  1. The four flags are mutually exclusive - exactly one, or none, is ever set.
 *  2. The flags are boolean getters, never methods, so `if (entity.isDirty)`
 *     means what it reads as. (The same mistake already shipped once here on
 *     `isValid`; see isvalid-contract.spec.ts.)
 *
 * The tests below are written to fail if either property is broken, rather than
 * to walk each line.
 */

type Flag = 'isNew' | 'isDirty' | 'isSelfDeleted' | 'isDeleted';

const ALL_FLAGS: Flag[] = ['isNew', 'isDirty', 'isSelfDeleted', 'isDeleted'];

/** The flags currently raised - the assertion subject for mutual exclusivity. */
const raisedFlags = (manager: TrackingStateManager): Flag[] =>
  ALL_FLAGS.filter((flag) => manager[flag]);

const TRANSITIONS: Array<{
  name: string;
  flag: Flag;
  apply: (manager: TrackingStateManager) => void;
}> = [
  { name: 'markAsNew', flag: 'isNew', apply: (m) => m.markAsNew() },
  { name: 'markAsDirty', flag: 'isDirty', apply: (m) => m.markAsDirty() },
  {
    name: 'markAsSelfDeleted',
    flag: 'isSelfDeleted',
    apply: (m) => m.markAsSelfDeleted(),
  },
  { name: 'markAsDeleted', flag: 'isDeleted', apply: (m) => m.markAsDeleted() },
];

/** Minimal detector that records its arguments; keeps the manager untouched. */
class SpyChangeDetector implements IChangeDetector {
  public calls: Array<{ props: unknown; manager: ITrackingStateManager }> = [];

  detectChanges<TProp extends IProps>(
    props: TProp,
    trackingStateManager: ITrackingStateManager,
  ): ITrackingStateManager {
    this.calls.push({ props, manager: trackingStateManager });
    return trackingStateManager;
  }
}

/**
 * A value object of the shape this library actually produces: its tracking
 * manager hangs off `trackingState`, never off `Tracking`. Declared here rather
 * than reusing StringValueObject so this spec pins the key name and nothing
 * else about a concrete value object.
 */
class Note extends DddValueObject<string> {
  static create(value: string): Note {
    return new Note(value);
  }

  protected getEqualityComponents(): Iterable<unknown> {
    return [this.getValue()];
  }
}

describe('TrackingStateManager', () => {
  describe('construction', () => {
    it('starts clean, with no flag raised', () => {
      // Surprising if you only read the class-level JSDoc, which shows
      // `new Order(props)` yielding isNew === true. The manager itself does
      // not assume "new"; DddAggregateRoot / DddValueObject call markAsNew()
      // separately. A manager that started dirty or new would make every
      // freshly rehydrated entity look like a pending write.
      const manager = new TrackingStateManager();

      expect(raisedFlags(manager)).toEqual([]);
      expect(manager.trackingProps).toEqual({
        isDirty: false,
        isNew: false,
        isDeleted: false,
        isSelfDeleted: false,
      });
    });

    it('falls back to the nested-property detector when none is injected', () => {
      // The default collaborator is asserted through its observable contract
      // (it rejects null props) rather than by instanceof, so the test still
      // holds if the default is swapped for another validating detector.
      const manager = new TrackingStateManager();

      expect(() => manager.getTracking(null as unknown as IProps)).toThrow(
        'ArgumentNullException: props cannot be null',
      );
    });

    it.each([
      ['undefined', undefined],
      ['null', null],
    ])(
      'falls back to the default detector when the argument is %s',
      (_label, detector) => {
        // The constructor guards with `||`, so any falsy argument - not just an
        // omitted one - must still leave a usable detector rather than a
        // manager whose getTracking() throws TypeError on first use.
        const manager = new TrackingStateManager(detector as IChangeDetector);

        expect(() => manager.getTracking({} as IProps)).not.toThrow();
      },
    );

    it('uses the injected detector instead of the default', () => {
      const detector = new SpyChangeDetector();
      const manager = new TrackingStateManager(detector);

      // The default would have thrown on null props; the injected one decides.
      expect(() =>
        manager.getTracking(null as unknown as IProps),
      ).not.toThrow();
      expect(detector.calls).toHaveLength(1);
    });
  });

  describe('flag accessors', () => {
    it('exposes the four flags as boolean getters, never as methods', () => {
      // `if (order.trackingState.isDirty)` is the idiom every repository uses.
      // If one of these ever became a method, the guard would be permanently
      // truthy and TypeScript would not complain - exactly the isValid bug.
      const manager = new TrackingStateManager();

      for (const flag of ALL_FLAGS) {
        expect(typeof manager[flag]).toBe('boolean');
      }
    });

    it('keeps the public mutators on the instance', () => {
      // Guards the shipped surface: consumers hold `trackingState` and call
      // these by name, so a rename is a breaking change, not a refactor.
      const manager = new TrackingStateManager();

      for (const name of [
        'markAsNew',
        'markAsDirty',
        'markAsSelfDeleted',
        'markAsDeleted',
        'markAsClean',
        'getTracking',
      ]) {
        expect(typeof manager[name]).toBe('function');
      }
    });
  });

  describe('state transitions', () => {
    it.each(TRANSITIONS)(
      '$name raises only $flag, from every starting state',
      ({ flag, apply }) => {
        // The whole 4x4 matrix in one case: each transition must clear whatever
        // was set before. A transition that forgot to reset would leave, say,
        // isNew and isDeleted both true, and the repository would insert a row
        // it was asked to delete.
        for (const start of TRANSITIONS) {
          const manager = new TrackingStateManager();
          start.apply(manager);
          expect(raisedFlags(manager)).toEqual([start.flag]);

          apply(manager);

          expect(raisedFlags(manager)).toEqual([flag]);
        }
      },
    );

    it.each(TRANSITIONS)('$name is idempotent', ({ flag, apply }) => {
      const manager = new TrackingStateManager();

      apply(manager);
      apply(manager);

      expect(raisedFlags(manager)).toEqual([flag]);
    });

    it.each(TRANSITIONS)(
      'markAsClean clears the state left by $name',
      ({ apply }) => {
        // Repositories call markAsClean() after a successful persist; if it
        // failed to clear one flag the entity would be written again on the
        // next flush.
        const manager = new TrackingStateManager();
        apply(manager);

        manager.markAsClean();

        expect(raisedFlags(manager)).toEqual([]);
      },
    );

    it('markAsClean clears every flag at once, even flags set out of band', () => {
      // The raw setters can raise several flags simultaneously (see below),
      // so markAsClean must reset all four unconditionally rather than assume
      // only one is up.
      const manager = new TrackingStateManager();
      manager.setDirty(true);
      manager.setNew(true);
      manager.setSelfDeleted(true);
      manager.setDeleted(true);

      manager.markAsClean();

      expect(raisedFlags(manager)).toEqual([]);
    });

    it('markAsClean on an already clean manager is a no-op', () => {
      const manager = new TrackingStateManager();

      manager.markAsClean();

      expect(raisedFlags(manager)).toEqual([]);
    });

    it('survives a long transition chain with the invariant intact', () => {
      // The lifecycle a real aggregate walks: created -> saved -> edited ->
      // saved -> cancelled -> removed. At no point may two flags coexist.
      const manager = new TrackingStateManager();
      const walk = [
        () => manager.markAsNew(),
        () => manager.markAsClean(),
        () => manager.markAsDirty(),
        () => manager.markAsClean(),
        () => manager.markAsSelfDeleted(),
        () => manager.markAsDeleted(),
        () => manager.markAsDirty(),
      ];

      for (const step of walk) {
        step();
        expect(raisedFlags(manager).length).toBeLessThanOrEqual(1);
      }

      expect(raisedFlags(manager)).toEqual(['isDirty']);
    });
  });

  describe('trackingProps', () => {
    it.each(TRANSITIONS)(
      'reflects the state set by $name',
      ({ flag, apply }) => {
        const manager = new TrackingStateManager();
        apply(manager);

        const props = manager.trackingProps;

        expect(props[flag]).toBe(true);
        expect(Object.entries(props).filter(([, value]) => value)).toHaveLength(
          1,
        );
      },
    );

    it('exposes exactly the four tracking keys', () => {
      // trackingProps is serialised into aggregate snapshots (toObject), so an
      // extra or missing key changes persisted payloads.
      const manager = new TrackingStateManager();

      expect(Object.keys(manager.trackingProps).sort()).toEqual([
        'isDeleted',
        'isDirty',
        'isNew',
        'isSelfDeleted',
      ]);
    });

    it('returns a detached snapshot, not a live view of the manager', () => {
      // It is a getter, so callers reasonably assume it is cheap and shared.
      // It is neither: each read builds a new object, and writing to that
      // object must not reach back into the manager.
      const manager = new TrackingStateManager();
      manager.markAsDirty();

      const first = manager.trackingProps;
      const second = manager.trackingProps;
      expect(first).not.toBe(second);
      expect(first).toEqual(second);

      first.isDirty = false;
      first.isDeleted = true;

      expect(manager.isDirty).toBe(true);
      expect(manager.isDeleted).toBe(false);
    });

    it('does not observe later transitions through an old snapshot', () => {
      const manager = new TrackingStateManager();
      manager.markAsNew();

      const snapshot = manager.trackingProps;
      manager.markAsDeleted();

      expect(snapshot).toEqual({
        isDirty: false,
        isNew: true,
        isDeleted: false,
        isSelfDeleted: false,
      });
    });
  });

  describe('getTracking', () => {
    it('returns the manager itself for chaining', () => {
      const manager = new TrackingStateManager();

      expect(manager.getTracking({} as IProps)).toBe(manager);
    });

    it('returns the manager even when the detector returns something else', () => {
      // The documented fluent form is
      // `entity.trackingState.getTracking(props).markAsDirty()`. That must not
      // depend on what a third-party IChangeDetector chooses to return.
      const decoy = new TrackingStateManager();
      const detector: IChangeDetector = {
        detectChanges: () => decoy,
      };
      const manager = new TrackingStateManager(detector);

      expect(manager.getTracking({} as IProps)).toBe(manager);
    });

    it('delegates to the detector with the caller props and itself', () => {
      // The manager passes `this` so the detector can drive the transitions.
      // Passing a copy, or a fresh manager, would make detection a no-op.
      const detector = new SpyChangeDetector();
      const manager = new TrackingStateManager(detector);
      const props = { quantity: 5 } as IProps;

      manager.getTracking(props);

      expect(detector.calls).toHaveLength(1);
      expect(detector.calls[0].props).toBe(props);
      expect(detector.calls[0].manager).toBe(manager);
    });

    it.each([
      ['null', null],
      ['undefined', undefined],
    ])(
      'propagates the default detector rejection for %s props',
      (_label, props) => {
        const manager = new TrackingStateManager();

        expect(() => manager.getTracking(props as unknown as IProps)).toThrow(
          'ArgumentNullException: props cannot be null',
        );
      },
    );

    it('adopts the state of a nested child that carries a Tracking manager', () => {
      // `Tracking` is the legacy key inherited from the C# port. Nothing in
      // this library produces it, but hand-rolled props do, so it stays
      // supported alongside `trackingState`.
      const child = new TrackingStateManager();
      child.markAsDirty();
      const manager = new TrackingStateManager();

      manager.getTracking({ line: { Tracking: child } } as IProps);

      expect(raisedFlags(manager)).toEqual(['isDirty']);
    });

    it('adopts the state of a nested child that carries a trackingState manager', () => {
      // `trackingState` is the name this library actually uses. The detector
      // recognised only `Tracking` until 3.0.x, so nested detection was dead
      // code for every object the library produces.
      const child = new TrackingStateManager();
      child.markAsDirty();
      const manager = new TrackingStateManager();

      manager.getTracking({ line: { trackingState: child } } as IProps);

      expect(raisedFlags(manager)).toEqual(['isDirty']);
    });

    it("sees this library's own value objects, which expose trackingState", () => {
      // The end-to-end shape of the defect: a props object holding a real
      // DddValueObject child. Before the fix this scanned to CLEAN, so an
      // aggregate whose child value object had just changed looked persisted.
      const child = Note.create('initial');
      child.setValue('changed');
      expect(child.trackingState.isDirty).toBe(true);

      const manager = new TrackingStateManager();

      manager.getTracking({ name: child } as unknown as IProps);

      expect(raisedFlags(manager)).toEqual(['isDirty']);
    });

    it('reads a plain trackingProps snapshot as well as a live manager', () => {
      // toObject() serialises the manager down to the four booleans; only the
      // flags are read, never the markAs* methods, so both shapes work.
      const manager = new TrackingStateManager();

      manager.getTracking({
        line: {
          trackingState: {
            isDirty: false,
            isNew: false,
            isSelfDeleted: false,
            isDeleted: true,
          },
        },
      } as IProps);

      expect(raisedFlags(manager)).toEqual(['isDeleted']);
    });

    it('ignores children without a Tracking manager', () => {
      const manager = new TrackingStateManager();

      manager.getTracking({
        name: 'John',
        age: 25,
        missing: null,
        plain: { nested: true },
      } as IProps);

      expect(raisedFlags(manager)).toEqual([]);
    });

    it('clears the current state when the props carry no tracked child', () => {
      // Surprising and worth stating plainly: getTracking is not additive.
      // The default detector calls markAsClean() before scanning, so
      // `markAsDirty(); getTracking(props)` ends up CLEAN whenever the props
      // hold nothing named `Tracking` - i.e. the pending write is dropped.
      // Documented in the detector ("Reseteamos el estado antes de detectar
      // cambios"); the ordering in the fluent example - getTracking first,
      // then markAsDirty - is therefore load-bearing, not cosmetic.
      const manager = new TrackingStateManager();
      manager.markAsDirty();

      manager.getTracking({ quantity: 5 } as IProps);

      expect(raisedFlags(manager)).toEqual([]);
    });

    it('keeps the flags mutually exclusive when several children are tracked', () => {
      // Each child state is applied through markAs*, and every markAs* resets
      // the other three - so a parent can never end up both dirty and new,
      // whatever the children say.
      const dirtyChild = new TrackingStateManager();
      dirtyChild.markAsDirty();
      const newChild = new TrackingStateManager();
      newChild.markAsNew();
      const manager = new TrackingStateManager();

      manager.getTracking({
        a: { trackingState: dirtyChild },
        b: { trackingState: newChild },
      } as IProps);

      expect(raisedFlags(manager)).toHaveLength(1);
    });

    it.each([
      ['declared first', (a: object, b: object) => ({ a, b })],
      ['declared last', (a: object, b: object) => ({ b, a })],
    ])(
      'lets the dirty child outrank a new sibling, %s',
      (_label, buildProps) => {
        // The surviving flag used to be whichever child Object.keys yielded
        // LAST, because markAs* was applied per child inside the loop. Same two
        // children, two key orders, one answer: precedence is
        // new < dirty < selfDeleted < deleted, and it is a property of the
        // states, not of how the props object happens to be written.
        const dirtyChild = new TrackingStateManager();
        dirtyChild.markAsDirty();
        const newChild = new TrackingStateManager();
        newChild.markAsNew();
        const manager = new TrackingStateManager();

        manager.getTracking(
          buildProps(
            { trackingState: dirtyChild },
            { trackingState: newChild },
          ) as IProps,
        );

        expect(raisedFlags(manager)).toEqual(['isDirty']);
      },
    );

    it('lets a removed child outrank every modified sibling', () => {
      // A pending removal is the one state that must never be masked: losing
      // it leaves the row behind. selfDeleted ranks just under deleted, and
      // both outrank dirty and new. ALL_FLAGS is already in ascending
      // precedence order, so index === rank.
      const children = TRANSITIONS.map(({ apply }) => {
        const child = new TrackingStateManager();
        apply(child);
        return { trackingState: child };
      });

      for (const rank of [3, 2]) {
        const manager = new TrackingStateManager();
        const props: IProps = {};

        // Children from `rank` down to the weakest, i.e. the winner is written
        // FIRST, so the result cannot be "whatever Object.keys yielded last".
        for (let index = rank; index >= 0; index--) {
          props[`p${index}`] = children[index];
        }

        manager.getTracking(props);

        expect(raisedFlags(manager)).toEqual([ALL_FLAGS[rank]]);
      }
    });

    it('leaves the children untouched', () => {
      // Detection reads child state; if it wrote back, marking a parent clean
      // after a save would be impossible to reason about.
      const child = new TrackingStateManager();
      child.markAsSelfDeleted();
      const manager = new TrackingStateManager();

      manager.getTracking({ line: { Tracking: child } } as IProps);

      expect(raisedFlags(child)).toEqual(['isSelfDeleted']);
    });
  });

  describe('the internal setters', () => {
    it.each([
      { name: 'setDirty', flag: 'isDirty' as Flag },
      { name: 'setNew', flag: 'isNew' as Flag },
      { name: 'setSelfDeleted', flag: 'isSelfDeleted' as Flag },
      { name: 'setDeleted', flag: 'isDeleted' as Flag },
    ])(
      '$name writes only its own flag, in both directions',
      ({ name, flag }) => {
        // These are raw on purpose: TrackingStateTransition resets all four and
        // then sets one. If a setter started cascading a reset of its own, that
        // sequence would still "work" by luck, and any future transition that
        // sets two flags in one step would break silently. Pinning the raw
        // behaviour keeps the transition strategy honest.
        const manager = new TrackingStateManager();

        manager[name](true);
        expect(raisedFlags(manager)).toEqual([flag]);

        manager[name](false);
        expect(raisedFlags(manager)).toEqual([]);
      },
    );

    it('can break the mutual-exclusion invariant, which is why they are @internal', () => {
      // Documented as internal, public only to satisfy ITrackingStateTransitions.
      // Application code must use the markAs* methods; this test exists so the
      // difference is visible rather than folklore.
      const manager = new TrackingStateManager();

      manager.setNew(true);
      manager.setDeleted(true);

      expect(raisedFlags(manager)).toEqual(['isNew', 'isDeleted']);

      // ...and any markAs* call restores the invariant.
      manager.markAsDirty();
      expect(raisedFlags(manager)).toEqual(['isDirty']);
    });
  });
});
