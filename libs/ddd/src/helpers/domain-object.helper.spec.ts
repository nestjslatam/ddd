import 'reflect-metadata';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';

import { DddAggregateRoot } from '../aggregate-root';
import {
  IdValueObject,
  NumberValueObject,
  StringValueObject,
} from '../valueobjects';
import { Type } from '../types';
import { DddObjectHelper } from './domain-object.helper';

/**
 * DddObjectHelper is the seam between the domain model and everything that has
 * to look at it from the outside: serialization (convertPropsToObject),
 * Nest's provider discovery (flatMap / filterProvider / extractMetadata) and
 * the event bus (getEventName).
 *
 * Every one of these is a static with no test of its own today, and each one
 * is called on paths that only fail at runtime -- a discovery helper that
 * silently returns [] does not break a build, it breaks an application at
 * boot. The tests below pin the branch behaviour rather than the happy path.
 */

interface OrderProps {
  customer: StringValueObject;
  total: NumberValueObject;
}

class Order extends DddAggregateRoot<Order, OrderProps> {
  constructor(props: OrderProps, id?: IdValueObject) {
    super(props, { id });
  }
}

/** Minimal stand-in for a Nest provider wrapper: only `instance` is read. */
const wrapperFor = (instance: unknown): InstanceWrapper =>
  ({ instance }) as InstanceWrapper;

/** Minimal stand-in for a Nest module: only `providers` is read. */
const moduleWith = (...wrappers: InstanceWrapper[]): Module =>
  ({
    providers: new Map(wrappers.map((w, i) => [`provider-${i}`, w])),
  }) as unknown as Module;

describe('DddObjectHelper', () => {
  let customer: StringValueObject;
  let total: NumberValueObject;
  let order: Order;

  beforeEach(() => {
    customer = StringValueObject.create('ACME');
    total = NumberValueObject.create(100);
    order = new Order({ customer, total });
  });

  describe('isEntity', () => {
    it('should return true for an aggregate root instance', () => {
      expect(DddObjectHelper.isEntity(order)).toBe(true);
    });

    it('should return false for a value object', () => {
      // Value objects and entities are the two halves of the model; confusing
      // them here would make convertToPlainObject call toObject() on a VO.
      expect(DddObjectHelper.isEntity(customer)).toBe(false);
      expect(DddObjectHelper.isEntity(IdValueObject.create())).toBe(false);
    });

    it('should return false for an object that merely looks like an aggregate', () => {
      // The check is `instanceof`, not duck typing. If somebody ever swaps it
      // for a shape test, this object would start passing and persistence
      // DTOs would be mistaken for entities.
      const lookalike = {
        id: IdValueObject.create(),
        props: {},
        toObject: () => ({}),
        version: 0,
      };

      expect(DddObjectHelper.isEntity(lookalike)).toBe(false);
    });

    it('should return false for the aggregate class itself rather than an instance', () => {
      // A constructor function is not an instance of itself.
      expect(DddObjectHelper.isEntity(Order)).toBe(false);
    });

    it('should return false for null, undefined and primitives', () => {
      expect(DddObjectHelper.isEntity(null)).toBe(false);
      expect(DddObjectHelper.isEntity(undefined)).toBe(false);
      expect(DddObjectHelper.isEntity('order')).toBe(false);
      expect(DddObjectHelper.isEntity(0)).toBe(false);
      expect(DddObjectHelper.isEntity(false)).toBe(false);
      expect(DddObjectHelper.isEntity({})).toBe(false);
      expect(DddObjectHelper.isEntity([])).toBe(false);
      expect(DddObjectHelper.isEntity(new Date())).toBe(false);
      expect(DddObjectHelper.isEntity(() => undefined)).toBe(false);
    });
  });

  describe('isDomainEntity', () => {
    it('should agree with isEntity for every input', () => {
      // isDomainEntity and isEntity are byte-for-byte the same predicate; both
      // are exported and both are used. Asserting they agree means a fix or a
      // tightening applied to only one of them fails here instead of causing
      // two call sites to disagree about what an entity is.
      const samples: unknown[] = [
        order,
        customer,
        IdValueObject.create(),
        Order,
        {},
        [],
        null,
        undefined,
        'order',
        42,
      ];

      for (const sample of samples) {
        expect(DddObjectHelper.isDomainEntity(sample)).toBe(
          DddObjectHelper.isEntity(sample),
        );
      }
    });
  });

  describe('isDomainPrimitive', () => {
    it('should return true for a wrapper carrying a `value` own property', () => {
      expect(DddObjectHelper.isDomainPrimitive({ value: 'text' })).toBe(true);
      expect(DddObjectHelper.isDomainPrimitive({ value: 10 })).toBe(true);
      expect(DddObjectHelper.isDomainPrimitive({ value: false })).toBe(true);
      expect(DddObjectHelper.isDomainPrimitive({ value: new Date() })).toBe(
        true,
      );
    });

    it('should return true when the own `value` property is null or undefined', () => {
      // Surprising but deliberate: the predicate asks whether the key exists,
      // not whether it holds anything. `{ value: undefined }` is a domain
      // primitive as far as this helper is concerned, so callers must still
      // null-check the payload after narrowing.
      expect(DddObjectHelper.isDomainPrimitive({ value: null })).toBe(true);
      expect(DddObjectHelper.isDomainPrimitive({ value: undefined })).toBe(
        true,
      );
    });

    it('should return true for a class instance whose `value` is an own field', () => {
      class Wrapper {
        value = 1;
      }

      expect(DddObjectHelper.isDomainPrimitive(new Wrapper())).toBe(true);
    });

    it('should return false when `value` is inherited instead of own', () => {
      // Object.hasOwn does not walk the prototype chain. A getter declared on
      // a class -- the usual way to expose `value` -- lives on the prototype,
      // so instances of it are NOT recognised. This is the single most
      // load-bearing branch in the helper and the easiest to break by
      // switching Object.hasOwn for the `in` operator.
      class WithGetter {
        get value(): number {
          return 1;
        }
      }

      expect(DddObjectHelper.isDomainPrimitive(new WithGetter())).toBe(false);
      expect(
        DddObjectHelper.isDomainPrimitive(Object.create({ value: 1 })),
      ).toBe(false);
    });

    it('should return false for library value objects', () => {
      // DddValueObject keeps its payload in a private property map and exposes
      // it through getValue(); it has no own `value`. Value objects are
      // therefore not domain primitives, which is why convertToPlainObject
      // checks isValueObject first.
      expect(DddObjectHelper.isDomainPrimitive(customer)).toBe(false);
      expect(DddObjectHelper.isDomainPrimitive(total)).toBe(false);
    });

    it('should return false for null, undefined and primitives', () => {
      expect(DddObjectHelper.isDomainPrimitive(null)).toBe(false);
      expect(DddObjectHelper.isDomainPrimitive(undefined)).toBe(false);
      expect(DddObjectHelper.isDomainPrimitive('value')).toBe(false);
      expect(DddObjectHelper.isDomainPrimitive(0)).toBe(false);
      expect(DddObjectHelper.isDomainPrimitive(true)).toBe(false);
    });

    it('should return false for a function even when it owns a `value` property', () => {
      // typeof fn === 'function', not 'object', so the guard rejects it before
      // Object.hasOwn ever runs.
      const fn = Object.assign(() => undefined, { value: 1 });

      expect(DddObjectHelper.isDomainPrimitive(fn)).toBe(false);
    });

    it('should return false for objects and arrays without a `value` key', () => {
      expect(DddObjectHelper.isDomainPrimitive({})).toBe(false);
      expect(DddObjectHelper.isDomainPrimitive({ amount: 1 })).toBe(false);
      expect(DddObjectHelper.isDomainPrimitive([])).toBe(false);
      expect(DddObjectHelper.isDomainPrimitive([1, 2, 3])).toBe(false);
    });

    it('should work on null-prototype objects', () => {
      const bag = Object.create(null);
      bag.value = 'text';

      expect(DddObjectHelper.isDomainPrimitive(bag)).toBe(true);
      expect(DddObjectHelper.isDomainPrimitive(Object.create(null))).toBe(
        false,
      );
    });
  });

  describe('convertToPlainObject', () => {
    it('should unwrap a value object to its raw value', () => {
      expect(DddObjectHelper.convertToPlainObject(customer)).toBe('ACME');
      expect(DddObjectHelper.convertToPlainObject(total)).toBe(100);
    });

    it('should unwrap an id value object to its uuid string', () => {
      const id = IdValueObject.create();

      expect(DddObjectHelper.convertToPlainObject(id)).toBe(id.getValue());
    });

    it('should convert an aggregate root through toObject', () => {
      const result = DddObjectHelper.convertToPlainObject(order);

      expect(result).toEqual(order.toObject());
      expect(result.id).toBe(order.id);
      expect(result.isValid).toBe(true);
    });

    it('should leave nested value objects inside an entity untouched', () => {
      // toObject() spreads props verbatim, so converting an entity yields an
      // object still holding value objects. Anyone serializing the result has
      // to convert one more level themselves.
      const result = DddObjectHelper.convertToPlainObject(order);

      expect(result.customer).toBe(customer);
      expect(result.total).toBe(total);
    });

    it('should return non-domain input unchanged and by reference', () => {
      const plain = { a: 1 };
      const list = [1, 2, 3];
      const date = new Date('2024-01-01T00:00:00.000Z');

      expect(DddObjectHelper.convertToPlainObject(plain)).toBe(plain);
      expect(DddObjectHelper.convertToPlainObject(list)).toBe(list);
      expect(DddObjectHelper.convertToPlainObject(date)).toBe(date);
      expect(DddObjectHelper.convertToPlainObject('text')).toBe('text');
      expect(DddObjectHelper.convertToPlainObject(7)).toBe(7);
      expect(DddObjectHelper.convertToPlainObject(false)).toBe(false);
    });

    it('should return null and undefined unchanged instead of throwing', () => {
      // convertPropsToObject guards against falsy props before calling this,
      // but convertToPlainObject is public and must survive being called
      // directly with nothing.
      expect(DddObjectHelper.convertToPlainObject(null)).toBeNull();
      expect(DddObjectHelper.convertToPlainObject(undefined)).toBeUndefined();
    });

    it('should not unpack a foreign object that merely exposes getValue/unpack', () => {
      // The unwrap branch is gated on instanceof DddValueObject, so a
      // structurally similar object from another library is passed through
      // untouched rather than silently flattened.
      const foreign = { getValue: () => 'unwrapped', unpack: () => 'unpacked' };

      expect(DddObjectHelper.convertToPlainObject(foreign)).toBe(foreign);
    });
  });

  describe('convertPropsToObject', () => {
    it('should throw when props is null or undefined', () => {
      expect(() => DddObjectHelper.convertPropsToObject(null)).toThrow(
        'Props is required',
      );
      expect(() => DddObjectHelper.convertPropsToObject(undefined)).toThrow(
        'Props is required',
      );
    });

    it('should unwrap every value object property', () => {
      const result = DddObjectHelper.convertPropsToObject({
        customer,
        total,
        active: true,
      });

      expect(result).toEqual({ customer: 'ACME', total: 100, active: true });
    });

    it('should not mutate the props it was given', () => {
      // It works on a spread copy. If that copy is ever dropped, an aggregate
      // would have its value objects replaced by raw values just by being
      // serialized -- a corruption that only shows up on the next save.
      const props = { customer, total };

      DddObjectHelper.convertPropsToObject(props);

      expect(props.customer).toBe(customer);
      expect(props.total).toBe(total);
    });

    it('should unwrap value objects held in arrays', () => {
      const tags = [
        StringValueObject.create('a'),
        StringValueObject.create('b'),
      ];

      const result = DddObjectHelper.convertPropsToObject({ tags });

      expect(result.tags).toEqual(['a', 'b']);
      // A new array, so the caller's array is left intact.
      expect(result.tags).not.toBe(tags);
      expect(tags[0]).toBeInstanceOf(StringValueObject);
    });

    it('should keep non-domain members of a mixed array as they are', () => {
      const mixed = [StringValueObject.create('vo'), 'raw', 3, null];

      const result = DddObjectHelper.convertPropsToObject({ mixed });

      expect(result.mixed).toEqual(['vo', 'raw', 3, null]);
    });

    it('should preserve an empty array', () => {
      const result = DddObjectHelper.convertPropsToObject({ items: [] });

      expect(result.items).toEqual([]);
    });

    it('should preserve falsy scalar properties', () => {
      // The `if (propsCopy[prop])` guard skips falsy members. That is only
      // safe because conversion is the identity for them -- this test is what
      // stops a future conversion step from being smuggled in behind a guard
      // that never runs for 0, '' or false.
      const result = DddObjectHelper.convertPropsToObject({
        zero: 0,
        empty: '',
        no: false,
        nothing: null,
        missing: undefined,
      });

      expect(result).toEqual({
        zero: 0,
        empty: '',
        no: false,
        nothing: null,
        missing: undefined,
      });
    });

    it('should convert an entity property through toObject', () => {
      const result = DddObjectHelper.convertPropsToObject({ order });

      expect(result.order.id).toBe(order.id);
      expect(result.order.isValid).toBe(true);
    });

    it('should convert only the top level, leaving nested plain objects alone', () => {
      // Conversion is shallow by design (it mirrors the shallow `{ ...props }`
      // copy). A value object buried inside a nested literal survives as a
      // value object, so aggregates with nested structures must flatten them
      // themselves before persisting.
      const result = DddObjectHelper.convertPropsToObject({
        shipping: { city: StringValueObject.create('Lima') },
      });

      expect(result.shipping.city).toBeInstanceOf(StringValueObject);
    });

    it('should return an empty object for empty props', () => {
      expect(DddObjectHelper.convertPropsToObject({})).toEqual({});
    });
  });

  describe('flatMap', () => {
    it('should collect the callback results across every module in order', () => {
      const a = wrapperFor({ tag: 'a' });
      const b = wrapperFor({ tag: 'b' });
      const c = wrapperFor({ tag: 'c' });

      const First = class First {};
      const Second = class Second {};
      const Third = class Third {};
      const byTag: Record<string, Type<any>> = {
        a: First,
        b: Second,
        c: Third,
      };

      const result = DddObjectHelper.flatMap({
        modules: [moduleWith(a, b), moduleWith(c)],
        callback: (wrapper) => byTag[(wrapper.instance as { tag: string }).tag],
      });

      // Module order first, then provider insertion order: discovery that
      // silently reorders would change which handler wins a duplicate
      // registration.
      expect(result).toEqual([First, Second, Third]);
    });

    it('should drop providers whose callback returns undefined', () => {
      const Kept = class Kept {};

      const result = DddObjectHelper.flatMap({
        modules: [
          moduleWith(wrapperFor({ keep: false }), wrapperFor({ keep: true })),
        ],
        callback: (wrapper) =>
          (wrapper.instance as { keep: boolean }).keep ? Kept : undefined,
      });

      expect(result).toEqual([Kept]);
    });

    it('should drop null results as well as undefined', () => {
      const result = DddObjectHelper.flatMap({
        modules: [moduleWith(wrapperFor({}), wrapperFor({}))],
        callback: () => null as unknown as Type<any>,
      });

      expect(result).toEqual([]);
    });

    it('should keep duplicates when two providers resolve to the same type', () => {
      // Deduplication is the caller's job; if flatMap ever started deduping,
      // a module registering a handler twice would stop double-registering
      // and the change would be invisible without this test.
      const Repeated = class Repeated {};

      const result = DddObjectHelper.flatMap({
        modules: [moduleWith(wrapperFor({}), wrapperFor({}))],
        callback: () => Repeated,
      });

      expect(result).toEqual([Repeated, Repeated]);
    });

    it('should return an empty array when there are no modules', () => {
      expect(
        DddObjectHelper.flatMap({ modules: [], callback: () => undefined }),
      ).toEqual([]);
    });

    it('should return an empty array when a module has no providers', () => {
      const callback = jest.fn();

      const result = DddObjectHelper.flatMap({
        modules: [moduleWith()],
        callback,
      });

      expect(result).toEqual([]);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('filterProvider', () => {
    const METADATA_KEY = 'ddd:test-handler';

    it('should return undefined when the wrapper has no instance', () => {
      // Nest leaves `instance` null for providers that are not resolved yet
      // (async/scoped). Reading metadata off null is how discovery crashes at
      // boot, so this guard has to stay.
      expect(
        DddObjectHelper.filterProvider(wrapperFor(null), METADATA_KEY),
      ).toBeUndefined();
      expect(
        DddObjectHelper.filterProvider(wrapperFor(undefined), METADATA_KEY),
      ).toBeUndefined();
    });

    it('should return the constructor of a decorated provider', () => {
      class DecoratedHandler {}
      Reflect.defineMetadata(METADATA_KEY, { name: 'x' }, DecoratedHandler);

      expect(
        DddObjectHelper.filterProvider(
          wrapperFor(new DecoratedHandler()),
          METADATA_KEY,
        ),
      ).toBe(DecoratedHandler);
    });

    it('should return undefined for a provider without the metadata key', () => {
      class PlainProvider {}

      expect(
        DddObjectHelper.filterProvider(
          wrapperFor(new PlainProvider()),
          METADATA_KEY,
        ),
      ).toBeUndefined();
    });

    it('should discriminate by metadata key', () => {
      class OnlyOtherKey {}
      Reflect.defineMetadata('ddd:other-key', {}, OnlyOtherKey);

      expect(
        DddObjectHelper.filterProvider(
          wrapperFor(new OnlyOtherKey()),
          METADATA_KEY,
        ),
      ).toBeUndefined();
      expect(
        DddObjectHelper.filterProvider(
          wrapperFor(new OnlyOtherKey()),
          'ddd:other-key',
        ),
      ).toBe(OnlyOtherKey);
    });

    it('should treat a falsy but present instance as absent', () => {
      // `if (!instance)` rejects 0 and '' too. Providers are objects in
      // practice, so this only matters as documentation of the guard's shape.
      expect(
        DddObjectHelper.filterProvider(wrapperFor(0), METADATA_KEY),
      ).toBeUndefined();
      expect(
        DddObjectHelper.filterProvider(wrapperFor(''), METADATA_KEY),
      ).toBeUndefined();
    });
  });

  describe('extractMetadata', () => {
    const METADATA_KEY = 'ddd:extract-test';

    it('should return the constructor when the metadata key is present', () => {
      class Annotated {}
      Reflect.defineMetadata(METADATA_KEY, { any: 'payload' }, Annotated);

      expect(
        DddObjectHelper.extractMetadata(new Annotated(), METADATA_KEY),
      ).toBe(Annotated);
    });

    it('should return undefined when the metadata key is missing', () => {
      class NotAnnotated {}

      expect(
        DddObjectHelper.extractMetadata(new NotAnnotated(), METADATA_KEY),
      ).toBeUndefined();
    });

    it('should return the subclass when the metadata sits on a base class', () => {
      // Reflect.getMetadata walks the prototype chain, so a subclass of a
      // decorated class is discovered too -- and the value returned is the
      // SUBCLASS constructor, not the annotated base. Discovery therefore
      // registers the concrete type, which is what a caller wants but is not
      // obvious from reading the two-line body.
      class AnnotatedBase {}
      Reflect.defineMetadata(METADATA_KEY, { any: 'payload' }, AnnotatedBase);
      class Derived extends AnnotatedBase {}

      expect(DddObjectHelper.extractMetadata(new Derived(), METADATA_KEY)).toBe(
        Derived,
      );
    });

    it('should return undefined when the instance has no constructor', () => {
      // Null-prototype bags (e.g. objects built with Object.create(null) from
      // config parsing) reach discovery in the wild; without this guard
      // Reflect.getMetadata would be handed undefined as its target.
      expect(
        DddObjectHelper.extractMetadata(Object.create(null), METADATA_KEY),
      ).toBeUndefined();
    });

    it('should look metadata up on the constructor, not on the instance', () => {
      // Metadata defined on the object itself must not count: decorators
      // always target the class, and matching per-instance metadata would let
      // one rogue object register a type globally.
      class Host {}
      const instance = new Host();
      Reflect.defineMetadata(METADATA_KEY, { any: 'payload' }, instance);

      expect(
        DddObjectHelper.extractMetadata(instance, METADATA_KEY),
      ).toBeUndefined();
    });

    it('should work for plain object literals with metadata on Object', () => {
      const key = 'ddd:object-literal-key';
      Reflect.defineMetadata(key, { any: 'payload' }, Object);

      try {
        expect(DddObjectHelper.extractMetadata({}, key)).toBe(Object);
      } finally {
        Reflect.deleteMetadata(key, Object);
      }
    });
  });

  describe('discovery pipeline (flatMap + filterProvider)', () => {
    it('should find only the decorated providers across modules', () => {
      // This is the composition the library actually ships: walk every
      // module's providers and keep the classes carrying a marker. Each part
      // is tested above; this checks they still fit together.
      const key = 'ddd:pipeline-key';

      class HandlerA {}
      class HandlerB {}
      class Unrelated {}
      Reflect.defineMetadata(key, {}, HandlerA);
      Reflect.defineMetadata(key, {}, HandlerB);

      const result = DddObjectHelper.flatMap({
        modules: [
          moduleWith(wrapperFor(new HandlerA()), wrapperFor(new Unrelated())),
          moduleWith(wrapperFor(null), wrapperFor(new HandlerB())),
        ],
        callback: (wrapper) => DddObjectHelper.filterProvider(wrapper, key),
      });

      expect(result).toEqual([HandlerA, HandlerB]);
    });
  });

  describe('getEventName', () => {
    it('should return the class name of an event instance', () => {
      class OrderPlacedEvent {
        constructor(public readonly orderId: string) {}
      }

      expect(DddObjectHelper.getEventName(new OrderPlacedEvent('1'))).toBe(
        'OrderPlacedEvent',
      );
    });

    it('should return the concrete subclass name, not the base name', () => {
      // Event routing keys off this string; returning the base name would
      // deliver every subclass to the base handler.
      class DomainEventBase {}
      class OrderShippedEvent extends DomainEventBase {}

      expect(DddObjectHelper.getEventName(new OrderShippedEvent())).toBe(
        'OrderShippedEvent',
      );
    });

    it('should read the prototype constructor, ignoring an own `constructor` property', () => {
      // A payload deserialized from JSON can carry a `constructor` key. The
      // helper goes through Object.getPrototypeOf first, so such a key cannot
      // spoof the event name.
      class RealEvent {}
      const event = Object.assign(new RealEvent(), {
        constructor: { name: 'SpoofedEvent' },
      });

      expect(DddObjectHelper.getEventName(event)).toBe('RealEvent');
    });

    it('should return Object for a plain object literal', () => {
      expect(DddObjectHelper.getEventName({ type: 'order.placed' })).toBe(
        'Object',
      );
    });

    it('should return the built-in name for arrays and dates', () => {
      expect(DddObjectHelper.getEventName([])).toBe('Array');
      expect(DddObjectHelper.getEventName(new Date())).toBe('Date');
    });

    it('should return an empty string for an anonymous class instance', () => {
      // Worth knowing: an inline `class {}` has no inferred name, so its
      // events would all register under ''. Same failure mode as a minifier
      // renaming classes -- event names must never be load-bearing across a
      // build unless the classes are named.
      expect(DddObjectHelper.getEventName(new (class {})())).toBe('');
    });

    it('should throw for null, undefined and null-prototype objects', () => {
      // There is no guard: getPrototypeOf(null) throws, and a null-prototype
      // object has no constructor to destructure. Callers must never hand the
      // event bus a bare bag.
      expect(() => DddObjectHelper.getEventName(null)).toThrow(TypeError);
      expect(() => DddObjectHelper.getEventName(undefined)).toThrow(TypeError);
      expect(() => DddObjectHelper.getEventName(Object.create(null))).toThrow(
        TypeError,
      );
    });
  });
});
