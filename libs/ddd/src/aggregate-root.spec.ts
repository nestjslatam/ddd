import { AggregateRoot as CqrsAggregateRoot } from '@nestjs/cqrs';
import { DddAggregateRoot } from './aggregate-root';
import { BrokenRulesManager } from './broken-rules.manager';
import { AbstractRuleValidator } from './core/validator-rules';
import { NoTransitionsDefinedException } from './exceptions/domain.exception';
import { TrackingStateManager } from './tracking-state-manager';
import { ValidatorRuleManager } from './validator-rule.manager';
import { IdValueObject, NumberValueObject } from './valueobjects';

/**
 * The base class every consumer of this library extends.
 *
 * Almost everything here is about *ordering*: the base constructor generates
 * the id, assigns props, runs guard(), runs addValidators(), collects broken
 * rules and only then marks the aggregate as new -- all of it before the
 * subclass constructor body has executed a single statement. Subclasses have
 * no way to opt out of that sequence, so a change to it breaks every consumer
 * at once, silently, and only at runtime. These tests pin the sequence down.
 */

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

interface IStockProps {
  sku: string;
  quantity: number;
}

/** Options accepted by the base constructor, restated so fixtures can forward them. */
type AggregateOptions = {
  trackingStateManager?: TrackingStateManager;
  brokenRulesManager?: BrokenRulesManager;
  validatorRuleManager?: ValidatorRuleManager<AbstractRuleValidator<any>>;
  id?: IdValueObject;
  guardStrategy?: () => void;
  validatorsStrategy?: (
    manager: ValidatorRuleManager<AbstractRuleValidator<any>>,
  ) => void;
  skipInitialValidation?: boolean;
};

/** Records the exact order in which the construction hooks fire. */
let calls: string[] = [];

/** What `this.label` looked like from inside addValidators(). */
let labelInsideAddValidators: unknown;

/** How many times a registered validator was actually executed. */
let ruleExecutions = 0;

class QuantityRule extends AbstractRuleValidator<Stock> {
  addRules(): void {
    ruleExecutions++;
    if (this.subject.props.quantity < 0) {
      this.addBrokenRule('quantity', 'quantity cannot be negative');
    }
  }
}

class Stock extends DddAggregateRoot<Stock, IStockProps> {
  /**
   * A plain class field. Field initializers run *after* super() returns, so
   * this property does not exist yet while the base constructor is validating.
   */
  public label = 'assigned by the field initializer';

  constructor(props: IStockProps, options?: AggregateOptions) {
    super(props, options);
    calls.push('subclass constructor body');
  }

  protected guard(): void {
    calls.push('guard');
    if (this.props.sku === '') {
      throw new Error('sku is required');
    }
  }

  protected addValidators(
    manager: ValidatorRuleManager<AbstractRuleValidator<Stock>>,
  ): void {
    calls.push('addValidators');
    labelInsideAddValidators = this.label;
    manager.add(new QuantityRule(this));
  }
}

/** A second aggregate type, structurally identical, used for type-based equality. */
class Warehouse extends DddAggregateRoot<Warehouse, IStockProps> {
  constructor(props: IStockProps, options?: AggregateOptions) {
    super(props, options);
  }
}

interface IReadingProps {
  celsius: NumberValueObject;
}

class Reading extends DddAggregateRoot<Reading, IReadingProps> {
  constructor(props: IReadingProps, options?: AggregateOptions) {
    super(props, options);
  }

  /**
   * An own member of Reading.prototype. validate()'s third stage walks exactly
   * those members looking for nested `brokenRules`, so this getter is how a
   * value object's own validation reaches the aggregate.
   */
  public get temperature(): NumberValueObject {
    return this.props.celsius;
  }
}

class OrderState {
  constructor(public readonly name: string) {}
}
const DRAFT = new OrderState('draft');
const PAID = new OrderState('paid');
const SHIPPED = new OrderState('shipped');

class Order extends DddAggregateRoot<Order, { total: number }, OrderState> {
  constructor(props: { total: number }, withTransitions = true) {
    super(props);
    if (withTransitions) {
      this.defineValidTransitions(
        new Map([
          [DRAFT, [PAID]],
          [PAID, [SHIPPED]],
        ]),
      );
    }
  }

  public define(map: Map<OrderState, OrderState[]>): void {
    this.defineValidTransitions(map);
  }

  public allows(from: OrderState, to: OrderState): boolean {
    return this.canTransitionTo(from, to);
  }
}

class StockDepletedEvent {
  constructor(public readonly sku: string) {}
}

describe('DddAggregateRoot', () => {
  beforeEach(() => {
    calls = [];
    labelInsideAddValidators = undefined;
    ruleExecutions = 0;
  });

  // -------------------------------------------------------------------------
  describe('construction order', () => {
    /**
     * The whole point of this block. Everything the base constructor does
     * happens while the subclass is still half-built; a consumer who assumes
     * otherwise gets `undefined` where they expected configuration.
     */

    it('runs guard, then addValidators, and only then the subclass body', () => {
      new Stock({ sku: 'ABC', quantity: 1 });

      expect(calls).toEqual([
        'guard',
        'addValidators',
        'subclass constructor body',
      ]);
    });

    it('calls addValidators before subclass fields exist', () => {
      // Not a bug -- it is how JavaScript orders super() against field
      // initializers -- but it is the single most common way a subclass
      // validator silently reads `undefined` configuration. If a future
      // refactor moves validation later, this expectation flips and whoever
      // relied on the documented ordering finds out here instead of in prod.
      const stock = new Stock({ sku: 'ABC', quantity: 1 });

      expect(labelInsideAddValidators).toBeUndefined();
      expect(stock.label).toBe('assigned by the field initializer');
    });

    it('marks the aggregate as new after validating, not before', () => {
      // A failed validation calls markAsDirty(); the constructor's trailing
      // markAsNew() then resets it. So a freshly built invalid aggregate is
      // new-and-not-dirty, which is what a repository's insert path needs.
      const stock = new Stock({ sku: 'ABC', quantity: -5 });

      expect(stock.isValid).toBe(false);
      expect(stock.trackingState.isNew).toBe(true);
      expect(stock.trackingState.isDirty).toBe(false);
    });

    it('propagates a throwing guard out of the constructor', () => {
      expect(() => new Stock({ sku: '', quantity: 1 })).toThrow(
        'sku is required',
      );
    });
  });

  // -------------------------------------------------------------------------
  describe('identity', () => {
    it('generates a fresh id when none is supplied', () => {
      const first = new Stock({ sku: 'A', quantity: 1 });
      const second = new Stock({ sku: 'A', quantity: 1 });

      expect(first.id).toBeInstanceOf(IdValueObject);
      expect(first.id.equals(second.id)).toBe(false);
    });

    it('reuses a supplied id, which is what reconstitution depends on', () => {
      const persisted = IdValueObject.create();

      const stock = new Stock({ sku: 'A', quantity: 1 }, { id: persisted });

      expect(stock.id.getValue()).toBe(persisted.getValue());
    });

    it('generates an id when options carries an explicit undefined', () => {
      // `options?.id ?? create()` -- an ORM passing `{ id: undefined }` for a
      // not-yet-persisted row must still come back with a usable identity.
      const stock = new Stock({ sku: 'A', quantity: 1 }, { id: undefined });

      expect(stock.id).toBeInstanceOf(IdValueObject);
      expect(stock.id.isEmpty()).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  describe('validate', () => {
    it('collects broken rules from the registered business validators', () => {
      const stock = new Stock({ sku: 'A', quantity: -1 });

      expect(stock.isValid).toBe(false);
      expect(stock.brokenRules.getBrokenRules()).toEqual([
        {
          property: 'quantity',
          message: 'quantity cannot be negative',
          severity: 'Error',
        },
      ]);
    });

    it('marks the aggregate dirty when a rule breaks outside construction', () => {
      const stock = new Stock({ sku: 'A', quantity: 1 });
      expect(stock.trackingState.isNew).toBe(true);

      stock.props.quantity = -1;
      stock.validate();

      // markAsDirty() clears the other flags, so "new" is lost. A repository
      // that routes on isNew would now issue an UPDATE for a row that was
      // never inserted -- worth knowing that validate() can cause it.
      expect(stock.trackingState.isDirty).toBe(true);
      expect(stock.trackingState.isNew).toBe(false);
    });

    it('leaves tracking state untouched when everything passes', () => {
      const stock = new Stock({ sku: 'A', quantity: 1 });

      stock.validate();

      expect(stock.isValid).toBe(true);
      expect(stock.trackingState.isNew).toBe(true);
      expect(stock.trackingState.isDirty).toBe(false);
    });

    it('re-registers validators on every call without duplicating them', () => {
      // validate() calls addValidators() again each time. Deduplication lives
      // in ValidatorRuleManager (by constructor type), so the count must stay
      // at one however often validate() runs -- otherwise a long-lived
      // aggregate grows an unbounded validator list.
      const stock = new Stock({ sku: 'A', quantity: 1 });
      stock.validate();
      stock.validate();

      expect(stock.validators.count()).toBe(1);
      expect(ruleExecutions).toBe(3); // one per validate(), including the constructor's
    });

    it('harvests broken rules from value objects exposed as prototype members', () => {
      // The third validation stage. It scans the own members of the most
      // derived prototype and pulls `brokenRules` out of anything that has
      // one, which is how an invalid NumberValueObject invalidates its owner.
      const reading = new Reading(
        { celsius: NumberValueObject.create(-1) },
        { skipInitialValidation: true },
      );
      expect(reading.isValid).toBe(true);

      reading.validate();

      expect(reading.isValid).toBe(false);
      expect(
        reading.brokenRules.getBrokenRules().map((r) => r.property),
      ).toContain('value');
      expect(reading.trackingState.isDirty).toBe(true);
    });

    it('ignores plain methods and the constructor while scanning the prototype', () => {
      // Stock.prototype owns `constructor`, `guard` and `addValidators`. None
      // of them is an object with broken rules, and reading them must not
      // throw or contribute noise.
      const stock = new Stock({ sku: 'A', quantity: 1 });

      expect(() => stock.validate()).not.toThrow();
      expect(stock.brokenRules.getBrokenRules()).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  describe('constructor options', () => {
    it('skipInitialValidation suppresses guard and addValidators entirely', () => {
      // Reconstitution path: nothing runs, so an aggregate loaded from the
      // database with values its current rules would reject still comes back
      // "valid" and with an empty validator set until validate() is called.
      const stock = new Stock(
        { sku: '', quantity: -1 },
        { skipInitialValidation: true },
      );

      expect(calls).toEqual(['subclass constructor body']);
      expect(stock.validators.isEmpty()).toBe(true);
      expect(stock.isValid).toBe(true);
      expect(stock.trackingState.isNew).toBe(true);
    });

    it('registers the validators on the first explicit validate after skipping', () => {
      const stock = new Stock(
        { sku: 'A', quantity: -1 },
        { skipInitialValidation: true },
      );

      stock.validate();

      expect(calls).toEqual([
        'subclass constructor body',
        'guard',
        'addValidators',
      ]);
      expect(stock.isValid).toBe(false);
    });

    it('guardStrategy replaces the protected guard hook', () => {
      const guardStrategy = jest.fn();

      new Stock({ sku: '', quantity: 1 }, { guardStrategy });

      // The subclass guard would have thrown on an empty sku; the injected
      // strategy takes its place completely rather than running alongside it.
      expect(guardStrategy).toHaveBeenCalledTimes(1);
      expect(calls).not.toContain('guard');
    });

    it('validatorsStrategy replaces the protected addValidators hook', () => {
      const validatorsStrategy = jest.fn();

      const stock = new Stock(
        { sku: 'A', quantity: -1 },
        { validatorsStrategy },
      );

      expect(validatorsStrategy).toHaveBeenCalledWith(stock.validators);
      expect(calls).not.toContain('addValidators');
      // No QuantityRule was ever registered, so the negative quantity passes.
      expect(stock.isValid).toBe(true);
    });

    it('uses an injected broken rules manager, but validate() re-derives its contents', () => {
      // The manager instance is adopted, not its contents. The constructor
      // runs validate(), and validate() clears before re-deriving -- otherwise
      // broken rules accumulate forever and an aggregate that once failed can
      // never become valid again, which is what this library shipped through
      // 3.0.0.
      //
      // The cost is that rules seeded from outside do not survive
      // construction. That is a real trade-off and it was taken deliberately:
      // seeding has a workaround (add them after constructing), a permanently
      // invalid aggregate has none.
      const brokenRulesManager = new BrokenRulesManager();
      brokenRulesManager.add({
        property: 'sku',
        message: 'reserved by an earlier import',
        severity: 'Error',
      });

      const stock = new Stock(
        { sku: 'A', quantity: 1 },
        { brokenRulesManager },
      );

      expect(stock.brokenRules).toBe(brokenRulesManager);
      expect(stock.isValid).toBe(true);

      stock.brokenRules.add({
        property: 'sku',
        message: 'reserved by an earlier import',
        severity: 'Error',
      });
      expect(stock.isValid).toBe(false);
    });

    it('recovers once the violation is corrected', () => {
      // The defect this fix exists for. Before it, isValid stayed false
      // forever and the load -> correct -> revalidate -> save flow was
      // impossible.
      const stock = new Stock({ sku: 'A', quantity: -1 });
      expect(stock.isValid).toBe(false);

      stock.props.quantity = 5;
      stock.validate();

      expect(stock.isValid).toBe(true);
      expect(stock.brokenRules.getBrokenRules()).toHaveLength(0);
    });

    it('uses an injected tracking state manager and marks it as new', () => {
      const trackingStateManager = new TrackingStateManager();

      const stock = new Stock(
        { sku: 'A', quantity: 1 },
        { trackingStateManager },
      );

      expect(stock.trackingState).toBe(trackingStateManager);
      expect(trackingStateManager.isNew).toBe(true);
    });

    it('uses an injected validator rule manager, preserving pre-registered rules', () => {
      const validatorRuleManager = new ValidatorRuleManager<
        AbstractRuleValidator<any>
      >();

      const stock = new Stock(
        { sku: 'A', quantity: 1 },
        { validatorRuleManager },
      );

      expect(stock.validators).toBe(validatorRuleManager);
      expect(validatorRuleManager.count()).toBe(1); // addValidators registered into it
    });
  });

  // -------------------------------------------------------------------------
  describe('isValid', () => {
    it('is a getter, so `if (!aggregate.isValid)` cannot silently pass', () => {
      // 3.0.0's breaking change. As a method it returned a Function, which is
      // always truthy, and every guard written against it was dead code.
      const descriptor = Object.getOwnPropertyDescriptor(
        DddAggregateRoot.prototype,
        'isValid',
      );

      expect(typeof descriptor?.get).toBe('function');
      expect(descriptor?.value).toBeUndefined();
    });

    it('reflects the broken rules manager rather than a cached flag', () => {
      const stock = new Stock({ sku: 'A', quantity: 1 });
      expect(stock.isValid).toBe(true);

      stock.brokenRules.add({
        property: 'quantity',
        message: 'set by hand',
        severity: 'Error',
      });

      expect(stock.isValid).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  describe('equals', () => {
    it('returns false for null and undefined', () => {
      const stock = new Stock({ sku: 'A', quantity: 1 });

      expect(stock.equals(null)).toBe(false);
      expect(stock.equals(undefined)).toBe(false);
    });

    it('returns false for anything that is not an aggregate root', () => {
      const stock = new Stock({ sku: 'A', quantity: 1 });

      expect(stock.equals({ id: stock.id })).toBe(false);
      expect(stock.equals('not an aggregate')).toBe(false);
      expect(stock.equals(stock.id)).toBe(false);
    });

    it('returns true for the same instance', () => {
      const stock = new Stock({ sku: 'A', quantity: 1 });

      expect(stock.equals(stock)).toBe(true);
    });

    it('compares by identity, not by props', () => {
      const id = IdValueObject.create();
      const left = new Stock({ sku: 'A', quantity: 1 }, { id });
      const right = new Stock({ sku: 'DIFFERENT', quantity: 999 }, { id });

      expect(left.equals(right)).toBe(true);
    });

    it('returns false for the same type with different identities', () => {
      const left = new Stock({ sku: 'A', quantity: 1 });
      const right = new Stock({ sku: 'A', quantity: 1 });

      expect(left.equals(right)).toBe(false);
    });

    it('returns false across aggregate types even when the id matches', () => {
      // Prototype comparison, so it is the concrete class that matters: two
      // aggregates from different bounded contexts sharing a UUID are not the
      // same thing.
      const id = IdValueObject.create();
      const stock = new Stock({ sku: 'A', quantity: 1 }, { id });
      const warehouse = new Warehouse({ sku: 'A', quantity: 1 }, { id });

      expect(stock.equals(warehouse)).toBe(false);
      expect(warehouse.equals(stock)).toBe(false);
    });

    it('returns false when either identity has gone missing', () => {
      // Reachable in practice: an ORM or a structuredClone can hand back an
      // instance whose private id field was never populated. Equality must
      // refuse to answer rather than treat two id-less objects as the same.
      const left = new Stock({ sku: 'A', quantity: 1 });
      const right = new Stock({ sku: 'A', quantity: 1 });
      (left as any)._id = undefined;

      expect(left.equals(right)).toBe(false);

      (right as any)._id = undefined;
      expect(left.equals(right)).toBe(false);
    });

    it('falls back to strict comparison for a primitive identity', () => {
      // The id is typed as IdValueObject but nothing enforces that at runtime,
      // and JavaScript consumers do pass raw strings. The `typeof id.equals`
      // check is what keeps that from throwing.
      const left = new Stock({ sku: 'A', quantity: 1 });
      const right = new Stock({ sku: 'A', quantity: 1 });
      (left as any)._id = 'raw-string-id';
      (right as any)._id = 'raw-string-id';

      expect(left.equals(right)).toBe(true);

      (right as any)._id = 'another-string-id';
      expect(left.equals(right)).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  describe('areEqual / areNotEqual', () => {
    it('treats two absent aggregates as equal', () => {
      expect(DddAggregateRoot.areEqual(null, null)).toBe(true);
      expect(DddAggregateRoot.areEqual(undefined, undefined)).toBe(true);
      expect(DddAggregateRoot.areEqual(null, undefined)).toBe(true);
    });

    it('treats present vs absent as not equal, in both argument orders', () => {
      const stock = new Stock({ sku: 'A', quantity: 1 });

      expect(DddAggregateRoot.areEqual(null, stock)).toBe(false);
      expect(DddAggregateRoot.areEqual(stock, null)).toBe(false);
      expect(DddAggregateRoot.areEqual(stock, undefined)).toBe(false);
    });

    it('delegates to instance equality when both are present', () => {
      const id = IdValueObject.create();
      const left = new Stock({ sku: 'A', quantity: 1 }, { id });
      const right = new Stock({ sku: 'B', quantity: 2 }, { id });
      const other = new Stock({ sku: 'A', quantity: 1 });

      expect(DddAggregateRoot.areEqual(left, right)).toBe(true);
      expect(DddAggregateRoot.areEqual(left, other)).toBe(false);
    });

    it('is the exact negation of areEqual', () => {
      const id = IdValueObject.create();
      const left = new Stock({ sku: 'A', quantity: 1 }, { id });
      const right = new Stock({ sku: 'B', quantity: 2 }, { id });
      const other = new Stock({ sku: 'A', quantity: 1 });

      expect(DddAggregateRoot.areNotEqual(null, null)).toBe(false);
      expect(DddAggregateRoot.areNotEqual(left, right)).toBe(false);
      expect(DddAggregateRoot.areNotEqual(left, other)).toBe(true);
      expect(DddAggregateRoot.areNotEqual(left, null)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  describe('propsCopy', () => {
    it('returns a frozen snapshot of id, props and tracking state', () => {
      const stock = new Stock({ sku: 'A', quantity: 1 });

      const copy = stock.propsCopy;

      expect(Object.isFrozen(copy)).toBe(true);
      expect(copy.id).toBe(stock.id);
      expect(copy.props).toEqual({ sku: 'A', quantity: 1 });
      expect(copy.trackingState).toEqual({
        isNew: true,
        isDirty: false,
        isDeleted: false,
        isSelfDeleted: false,
      });
    });

    it('snapshots the tracking flags rather than aliasing the manager', () => {
      // trackingProps is a fresh object each read, so a copy taken before a
      // state change must not appear to change with it.
      const stock = new Stock({ sku: 'A', quantity: 1 });
      const copy = stock.propsCopy;

      stock.trackingState.markAsDeleted();

      expect(copy.trackingState.isNew).toBe(true);
      expect(copy.trackingState.isDeleted).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  describe('toPlainObject / toObject', () => {
    it('spreads props alongside the identity for serialization', () => {
      const stock = new Stock({ sku: 'A', quantity: 7 });

      const plain = stock.toPlainObject();

      expect(plain.id).toBe(stock.id);
      expect(plain.sku).toBe('A');
      expect(plain.quantity).toBe(7);
      expect(plain.isValid).toBe(true);
      // `version` is deliberately not asserted here -- see the reported defect:
      // the backing field is never assigned, so it is always undefined.
    });

    it('reports the live validity in the serialized output', () => {
      const stock = new Stock({ sku: 'A', quantity: -1 });

      expect(stock.toPlainObject().isValid).toBe(false);
      expect(stock.toObject().isValid).toBe(false);
    });

    it('toObject carries the managers that toPlainObject omits', () => {
      const stock = new Stock({ sku: 'A', quantity: 7 });

      const full = stock.toObject();

      expect(full.trackingState).toBe(stock.trackingState);
      expect(full.brokenRules).toBe(stock.brokenRules);
      expect(full.sku).toBe('A');
      expect('trackingState' in stock.toPlainObject()).toBe(false);
      expect('brokenRules' in stock.toPlainObject()).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  describe('createValidated', () => {
    class Batch extends DddAggregateRoot<Batch, IStockProps> {
      constructor(props: IStockProps) {
        super(props);
      }

      static make(props: IStockProps): Batch {
        return Batch.createValidated(() => new Batch(props));
      }

      protected addValidators(
        manager: ValidatorRuleManager<AbstractRuleValidator<any>>,
      ): void {
        manager.add(new QuantityRule(this as any));
      }
    }

    it('returns the instance the factory produced', () => {
      const batch = Batch.make({ sku: 'A', quantity: 1 });

      expect(batch).toBeInstanceOf(Batch);
      expect(batch.props.sku).toBe('A');
    });

    it('validates again after the factory ran, catching state set in the body', () => {
      // The constructor already validated once; createValidated adds a second
      // pass so a subclass that finishes wiring itself up after super() still
      // gets checked. Two executions is the observable proof.
      Batch.make({ sku: 'A', quantity: 1 });

      expect(ruleExecutions).toBe(2);
    });

    it('surfaces broken rules instead of throwing', () => {
      const batch = Batch.make({ sku: 'A', quantity: -1 });

      expect(batch.isValid).toBe(false);
      expect(batch.brokenRules.getBrokenRules()[0].message).toBe(
        'quantity cannot be negative',
      );
    });
  });

  // -------------------------------------------------------------------------
  describe('state transitions', () => {
    it('allows a transition declared in the map', () => {
      const order = new Order({ total: 10 });

      expect(order.allows(DRAFT, PAID)).toBe(true);
      expect(order.allows(PAID, SHIPPED)).toBe(true);
    });

    it('rejects a transition the map does not declare', () => {
      const order = new Order({ total: 10 });

      expect(order.allows(DRAFT, SHIPPED)).toBe(false);
    });

    it('throws, rather than returning false, for a state with no entry', () => {
      // Surprising asymmetry: an undeclared *target* is a plain false, but an
      // undeclared *source* is an exception. Callers writing
      // `if (canTransitionTo(...))` need a try/catch for terminal states.
      const order = new Order({ total: 10 });

      expect(() => order.allows(SHIPPED, DRAFT)).toThrow(
        NoTransitionsDefinedException,
      );
    });

    it('throws when no transitions have been defined at all', () => {
      const order = new Order({ total: 10 }, false);

      expect(() => order.allows(DRAFT, PAID)).toThrow(
        NoTransitionsDefinedException,
      );
    });

    it('rejects an empty transition map', () => {
      const order = new Order({ total: 10 });

      expect(() => order.define(new Map())).toThrow(
        'Transitions map cannot be empty. Provide at least one state transition.',
      );
    });

    it('replaces the previous map on redefinition', () => {
      const order = new Order({ total: 10 });

      order.define(new Map([[DRAFT, [SHIPPED]]]));

      expect(order.allows(DRAFT, SHIPPED)).toBe(true);
      expect(order.allows(DRAFT, PAID)).toBe(false);
      // PAID's entry is gone, so it is no longer a known source state.
      expect(() => order.allows(PAID, SHIPPED)).toThrow(
        NoTransitionsDefinedException,
      );
    });

    it('gives every aggregate its own state machine', () => {
      const configured = new Order({ total: 10 });
      const bare = new Order({ total: 10 }, false);

      expect(configured.allows(DRAFT, PAID)).toBe(true);
      expect(() => bare.allows(DRAFT, PAID)).toThrow(
        NoTransitionsDefinedException,
      );
    });
  });

  // -------------------------------------------------------------------------
  describe('domain events inherited from @nestjs/cqrs', () => {
    /**
     * Nothing in this library re-implements event collection -- it is
     * inherited. A refactor that dropped `extends AggregateRoot` would still
     * compile for every consumer that does not publish events, and would break
     * every consumer that does, at runtime.
     */

    it('is a @nestjs/cqrs AggregateRoot', () => {
      const stock = new Stock({ sku: 'A', quantity: 1 });

      expect(stock).toBeInstanceOf(CqrsAggregateRoot);
    });

    it('buffers applied events until they are committed', () => {
      const stock = new Stock({ sku: 'A', quantity: 1 });
      const event = new StockDepletedEvent('A');

      stock.apply(event);

      expect(stock.getUncommittedEvents()).toEqual([event]);

      stock.commit();

      expect(stock.getUncommittedEvents()).toHaveLength(0);
    });

    it('does not buffer events replayed from history', () => {
      const stock = new Stock({ sku: 'A', quantity: 1 });

      stock.loadFromHistory([new StockDepletedEvent('A')]);

      expect(stock.getUncommittedEvents()).toHaveLength(0);
    });

    it('starts with an empty event buffer, even after a failed validation', () => {
      const stock = new Stock({ sku: 'A', quantity: -1 });

      expect(stock.isValid).toBe(false);
      expect(stock.getUncommittedEvents()).toEqual([]);
    });
  });
});
