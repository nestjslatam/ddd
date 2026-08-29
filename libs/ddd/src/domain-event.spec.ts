import {
  AbstractDomainEvent,
  DomainEvent,
  EventMetadata,
  EventMetadataBuilder,
} from './domain-event';
import { ArgumentNullException } from './exceptions/domain.exception';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const FIXED_TIMESTAMP = '2026-01-01T00:00:00.000Z';

/**
 * Valid metadata with a single field overridden per case, so that a failing
 * test points at the field it is exercising and not at fixture drift.
 */
const md = (overrides: Partial<EventMetadata> = {}): EventMetadata => ({
  aggregateId: 'order-1',
  aggregateType: 'Order',
  aggregateVersion: 1,
  eventVersion: 1,
  timestamp: FIXED_TIMESTAMP,
  ...overrides,
});

/** No payload of its own, so it isolates what the base class contributes. */
class PingEvent extends DomainEvent {}

/** The event shape the DomainEvent docblock documents, kept executable. */
class OrderCreatedEvent extends DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly total: number,
    metadata: EventMetadata,
    occurredOn?: Date,
  ) {
    super(metadata, occurredOn);
  }

  static fromJSON(json: Record<string, unknown>): OrderCreatedEvent {
    const data = this.extractEventData(json);
    return new OrderCreatedEvent(
      data.orderId as string,
      data.total as number,
      this.extractMetadata(json),
      this.extractOccurredOn(json),
    );
  }
}

/** Payload with a Date, an array and an explicitly undefined field. */
class ShipmentDispatchedEvent extends DomainEvent {
  constructor(
    public readonly shippedAt: Date,
    public readonly items: string[],
    public readonly carrier: string,
    metadata: EventMetadata,
  ) {
    super(metadata);
  }
}

/**
 * Exposes the protected members so they can be tested without a `as any`
 * cast that would hide a signature change.
 */
class ProbeEvent extends DomainEvent {
  static metadataOf(json: Record<string, unknown>): EventMetadata {
    return this.extractMetadata(json);
  }

  static dataOf(json: Record<string, unknown>): Record<string, unknown> {
    return this.extractEventData(json);
  }

  static occurredOnOf(json: Record<string, unknown>): Date {
    return this.extractOccurredOn(json);
  }

  eventData(): Record<string, unknown> {
    return this.getEventData();
  }
}

describe('EventMetadataBuilder', () => {
  describe('create', () => {
    it('should seed eventVersion to 1 and the timestamp to now', () => {
      const before = Date.now();
      const metadata = EventMetadataBuilder.create('a-1', 'Order', 0).build();
      const after = Date.now();

      expect(metadata.eventVersion).toBe(1);
      expect(Date.parse(metadata.timestamp)).toBeGreaterThanOrEqual(before);
      expect(Date.parse(metadata.timestamp)).toBeLessThanOrEqual(after);
    });

    it('should throw ArgumentNullException when aggregateId is missing', () => {
      expect(() => EventMetadataBuilder.create('', 'Order', 1)).toThrow(
        ArgumentNullException,
      );
      expect(() => EventMetadataBuilder.create(null, 'Order', 1)).toThrow(
        ArgumentNullException,
      );
      expect(() => EventMetadataBuilder.create(undefined, 'Order', 1)).toThrow(
        ArgumentNullException,
      );
    });

    it('should throw ArgumentNullException when aggregateType is missing', () => {
      expect(() => EventMetadataBuilder.create('a-1', '', 1)).toThrow(
        ArgumentNullException,
      );
      expect(() => EventMetadataBuilder.create('a-1', null, 1)).toThrow(
        ArgumentNullException,
      );
    });

    it('should accept aggregateVersion 0 but reject negatives', () => {
      // 0 is the version of an aggregate that has not applied an event yet,
      // so the boundary has to stay inclusive or new aggregates cannot emit.
      expect(
        EventMetadataBuilder.create('a-1', 'Order', 0).build().aggregateVersion,
      ).toBe(0);
      expect(() => EventMetadataBuilder.create('a-1', 'Order', -1)).toThrow(
        'aggregateVersion must be non-negative',
      );
    });
  });

  describe('withEventVersion', () => {
    it('should accept 1 as the lowest schema version', () => {
      const metadata = EventMetadataBuilder.create('a-1', 'Order', 1)
        .withEventVersion(1)
        .build();

      expect(metadata.eventVersion).toBe(1);
    });

    it('should reject versions below 1', () => {
      // Event schema versions are 1-based; a 0 would make schema evolution
      // ambiguous against the default assigned in the constructor.
      const builder = EventMetadataBuilder.create('a-1', 'Order', 1);

      expect(() => builder.withEventVersion(0)).toThrow(
        'eventVersion must be at least 1',
      );
      expect(() => builder.withEventVersion(-3)).toThrow(
        'eventVersion must be at least 1',
      );
    });

    it('should keep the previous version when the new one is rejected', () => {
      const builder = EventMetadataBuilder.create('a-1', 'Order', 1)
        .withEventVersion(4)
        .withCorrelationId('corr-1');

      expect(() => builder.withEventVersion(0)).toThrow();

      expect(builder.build().eventVersion).toBe(4);
    });
  });

  describe('withTimestamp', () => {
    it('should normalise a Date to an ISO 8601 string', () => {
      const metadata = EventMetadataBuilder.create('a-1', 'Order', 1)
        .withTimestamp(new Date(Date.UTC(2026, 0, 1)))
        .build();

      expect(metadata.timestamp).toBe(FIXED_TIMESTAMP);
    });

    it('should pass a string timestamp through untouched', () => {
      const metadata = EventMetadataBuilder.create('a-1', 'Order', 1)
        .withTimestamp(FIXED_TIMESTAMP)
        .build();

      expect(metadata.timestamp).toBe(FIXED_TIMESTAMP);
    });
  });

  describe('fluent chaining', () => {
    it('should return the same builder from every with* method', () => {
      const builder = EventMetadataBuilder.create('a-1', 'Order', 1);

      expect(builder.withEventVersion(2)).toBe(builder);
      expect(builder.withCorrelationId('c')).toBe(builder);
      expect(builder.withCausationId('x')).toBe(builder);
      expect(builder.withUserId('u')).toBe(builder);
      expect(builder.withTimestamp(new Date())).toBe(builder);
    });

    it('should collect every optional field regardless of call order', () => {
      const metadata = EventMetadataBuilder.create('order-9', 'Order', 7)
        .withUserId('user-1')
        .withTimestamp(FIXED_TIMESTAMP)
        .withCausationId('cmd-1')
        .withEventVersion(3)
        .withCorrelationId('req-1')
        .build();

      expect(metadata).toEqual({
        aggregateId: 'order-9',
        aggregateType: 'Order',
        aggregateVersion: 7,
        eventVersion: 3,
        correlationId: 'req-1',
        causationId: 'cmd-1',
        userId: 'user-1',
        timestamp: FIXED_TIMESTAMP,
      });
    });
  });

  describe('build', () => {
    it('should emit the optional keys as undefined when never set', () => {
      const metadata = EventMetadataBuilder.create('a-1', 'Order', 1).build();

      // The keys exist with an undefined value rather than being absent.
      // That matters because Object.keys() sees them but JSON.stringify
      // drops them, so a stored event and an in-memory one do not have the
      // same key set.
      expect('correlationId' in metadata).toBe(true);
      expect(metadata.correlationId).toBeUndefined();
      expect(metadata.causationId).toBeUndefined();
      expect(metadata.userId).toBeUndefined();
      expect(JSON.parse(JSON.stringify(metadata))).not.toHaveProperty(
        'correlationId',
      );
    });

    it('should snapshot the builder so later mutation does not leak back', () => {
      // A builder is often reused across a batch of events; if build()
      // returned a live view, every earlier event would silently acquire the
      // last correlationId written.
      const builder = EventMetadataBuilder.create('a-1', 'Order', 1);
      const first = builder.build();

      builder.withCorrelationId('req-2').withUserId('user-2');
      const second = builder.build();

      expect(first.correlationId).toBeUndefined();
      expect(second.correlationId).toBe('req-2');
      expect(first).not.toBe(second);
    });
  });
});

describe('DomainEvent', () => {
  describe('constructor validation', () => {
    it('should throw ArgumentNullException when metadata is absent', () => {
      expect(() => new PingEvent(null)).toThrow(ArgumentNullException);
      expect(() => new PingEvent(undefined)).toThrow(
        'metadata cannot be null or undefined',
      );
    });

    it('should reject an empty aggregateId', () => {
      expect(() => new PingEvent(md({ aggregateId: '' }))).toThrow(
        'EventMetadata.aggregateId is required',
      );
    });

    it('should reject an empty aggregateType', () => {
      expect(() => new PingEvent(md({ aggregateType: '' }))).toThrow(
        'EventMetadata.aggregateType is required',
      );
    });

    it('should report the missing aggregateId first when both are missing', () => {
      // The check order is part of the contract: callers match on the message
      // to tell which field their mapper failed to populate.
      expect(
        () => new PingEvent(md({ aggregateId: '', aggregateType: '' })),
      ).toThrow('EventMetadata.aggregateId is required');
    });

    it('should reject a negative aggregateVersion but accept 0', () => {
      expect(() => new PingEvent(md({ aggregateVersion: -1 }))).toThrow(
        'EventMetadata.aggregateVersion must be non-negative',
      );
      expect(new PingEvent(md({ aggregateVersion: 0 })).aggregateVersion).toBe(
        0,
      );
    });

    it('should reject an eventVersion below 1 but accept 1', () => {
      expect(() => new PingEvent(md({ eventVersion: 0 }))).toThrow(
        'EventMetadata.eventVersion must be at least 1',
      );
      expect(new PingEvent(md({ eventVersion: 1 })).eventVersion).toBe(1);
    });
  });

  describe('identity', () => {
    it('should assign a fresh uuid v4 to every event', () => {
      const first = new PingEvent(md());
      const second = new PingEvent(md());

      expect(first.eventId).toMatch(UUID_V4);
      expect(second.eventId).toMatch(UUID_V4);
      expect(first.eventId).not.toBe(second.eventId);
    });

    it('should name eventType after the concrete subclass', () => {
      // Derived from constructor.name, so a build that mangles class names
      // silently breaks deserialization routing. Worth failing loudly here.
      expect(new PingEvent(md()).eventType).toBe('PingEvent');
      expect(new OrderCreatedEvent('o-1', 10, md()).eventType).toBe(
        'OrderCreatedEvent',
      );
    });

    it('should copy eventVersion out of the metadata', () => {
      const event = new PingEvent(md({ eventVersion: 4 }));

      expect(event.eventVersion).toBe(4);
      expect(event.metadata.eventVersion).toBe(4);
    });
  });

  describe('occurredOn', () => {
    it('should default to the current time', () => {
      const before = Date.now();
      const event = new PingEvent(md());
      const after = Date.now();

      expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(before);
      expect(event.occurredOn.getTime()).toBeLessThanOrEqual(after);
    });

    it('should keep an explicit timestamp for replay and fixed-clock tests', () => {
      const at = new Date(FIXED_TIMESTAMP);
      const event = new PingEvent(md(), at);

      expect(event.occurredOn.getTime()).toBe(at.getTime());
    });

    it('should keep the epoch instead of falling back to now', () => {
      // The default is chosen with `occurredOn || new Date()`. A Date is
      // always truthy, but a refactor to a numeric timestamp would make the
      // epoch falsy and quietly stamp replayed events with today's date.
      const event = new PingEvent(md(), new Date(0));

      expect(event.occurredOn.getTime()).toBe(0);
    });
  });

  describe('metadata handling', () => {
    it('should preserve the metadata timestamp when one is supplied', () => {
      const event = new PingEvent(
        md({ timestamp: FIXED_TIMESTAMP }),
        new Date(Date.UTC(2030, 5, 5)),
      );

      // occurredOn and metadata.timestamp are independent: the metadata one
      // wins when present, so a replayed event keeps its recorded time.
      expect(event.metadata.timestamp).toBe(FIXED_TIMESTAMP);
      expect(event.occurredOn.toISOString()).not.toBe(FIXED_TIMESTAMP);
    });

    it('should fall back to occurredOn when the timestamp is blank', () => {
      const at = new Date(FIXED_TIMESTAMP);

      expect(new PingEvent(md({ timestamp: '' }), at).metadata.timestamp).toBe(
        FIXED_TIMESTAMP,
      );
      expect(
        new PingEvent(md({ timestamp: undefined }), at).metadata.timestamp,
      ).toBe(FIXED_TIMESTAMP);
    });

    it('should copy the metadata so later mutation of the source is ignored', () => {
      // Events are immutable by contract; holding the caller's object would
      // let an aggregate rewrite the history it already published.
      const source = md();
      const event = new PingEvent(source);

      (source as { aggregateId: string }).aggregateId = 'tampered';

      expect(event.metadata).not.toBe(source);
      expect(event.aggregateId).toBe('order-1');
    });

    it('should carry the optional correlation fields through untouched', () => {
      const event = new PingEvent(
        md({ correlationId: 'req-1', causationId: 'cmd-1', userId: 'user-1' }),
      );

      expect(event.metadata.correlationId).toBe('req-1');
      expect(event.metadata.causationId).toBe('cmd-1');
      expect(event.metadata.userId).toBe('user-1');
    });
  });

  describe('toJSON', () => {
    it('should emit every field an event store needs to reconstruct the event', () => {
      const at = new Date(FIXED_TIMESTAMP);
      const event = new OrderCreatedEvent('order-1', 99.5, md(), at);

      expect(event.toJSON()).toEqual({
        eventId: event.eventId,
        eventType: 'OrderCreatedEvent',
        eventVersion: 1,
        occurredOn: FIXED_TIMESTAMP,
        metadata: event.metadata,
        data: { orderId: 'order-1', total: 99.5 },
      });
    });

    it('should serialise occurredOn as an ISO string, not a Date', () => {
      const json = new PingEvent(md(), new Date(FIXED_TIMESTAMP)).toJSON();

      expect(typeof json.occurredOn).toBe('string');
      expect(json.occurredOn).toBe(FIXED_TIMESTAMP);
    });

    it('should be picked up implicitly by JSON.stringify', () => {
      // ISerializable is only useful if the standard serialisation path uses
      // it; a rename to `serialize()` would pass every direct-call test and
      // still write raw instances into the event store.
      const event = new OrderCreatedEvent('order-1', 12, md());
      const stringified = JSON.parse(JSON.stringify(event));

      expect(stringified).toEqual(JSON.parse(JSON.stringify(event.toJSON())));
      expect(stringified.data).toEqual({ orderId: 'order-1', total: 12 });
    });

    it('should round-trip through the documented fromJSON helpers', () => {
      const at = new Date(FIXED_TIMESTAMP);
      const original = new OrderCreatedEvent('order-7', 42, md(), at);

      const replayed = OrderCreatedEvent.fromJSON(
        JSON.parse(JSON.stringify(original.toJSON())),
      );

      expect(replayed.orderId).toBe('order-7');
      expect(replayed.total).toBe(42);
      expect(replayed.occurredOn.getTime()).toBe(at.getTime());
      expect(replayed.aggregateId).toBe('order-1');
      expect(replayed.aggregateVersion).toBe(1);
      // A replayed event is a new instance and therefore a new identity;
      // eventId is not preserved by the base class round-trip.
      expect(replayed.eventId).not.toBe(original.eventId);
    });
  });

  describe('getEventData', () => {
    it('should include only the subclass payload, never the base fields', () => {
      const event = new OrderCreatedEvent('order-1', 5, md());

      expect(Object.keys(event.toJSON().data)).toEqual(['orderId', 'total']);
    });

    it('should return an empty payload for an event with no own fields', () => {
      expect(new PingEvent(md()).toJSON().data).toEqual({});
    });

    it('should convert top-level Date fields to ISO strings', () => {
      const shippedAt = new Date(FIXED_TIMESTAMP);
      const event = new ShipmentDispatchedEvent(
        shippedAt,
        ['sku-1', 'sku-2'],
        'DHL',
        md(),
      );

      const data = event.toJSON().data as Record<string, unknown>;

      expect(data.shippedAt).toBe(FIXED_TIMESTAMP);
      expect(data.items).toEqual(['sku-1', 'sku-2']);
      expect(data.carrier).toBe('DHL');
    });

    it('should keep a payload field that was explicitly set to undefined', () => {
      // Object.keys picks up assigned-but-undefined properties, so the key
      // survives in memory and disappears once stringified.
      const event = new OrderCreatedEvent('order-1', undefined, md());
      const data = event.toJSON().data as Record<string, unknown>;

      expect('total' in data).toBe(true);
      expect(data.total).toBeUndefined();
    });

    it('should be overridable by a subclass that shapes its own payload', () => {
      class CustomPayloadEvent extends DomainEvent {
        constructor(
          public readonly secret: string,
          metadata: EventMetadata,
        ) {
          super(metadata);
        }

        protected override getEventData(): Record<string, unknown> {
          return { redacted: true };
        }
      }

      expect(new CustomPayloadEvent('hunter2', md()).toJSON().data).toEqual({
        redacted: true,
      });
    });
  });

  describe('extractMetadata', () => {
    it('should return the metadata block of an event JSON', () => {
      const metadata = md();

      expect(ProbeEvent.metadataOf({ metadata })).toEqual(metadata);
    });

    it('should throw when the metadata field is missing or empty', () => {
      expect(() => ProbeEvent.metadataOf({})).toThrow(
        'Event JSON missing metadata field',
      );
      expect(() => ProbeEvent.metadataOf({ metadata: null })).toThrow(
        'Event JSON missing metadata field',
      );
    });
  });

  describe('extractEventData', () => {
    it('should return the data payload when present', () => {
      expect(ProbeEvent.dataOf({ data: { orderId: 'o-1' } })).toEqual({
        orderId: 'o-1',
      });
    });

    it('should default to an empty object for events without a payload', () => {
      // Marker events serialise with data: {}, and JSON.stringify drops an
      // undefined payload entirely; both must deserialise without throwing.
      expect(ProbeEvent.dataOf({})).toEqual({});
      expect(ProbeEvent.dataOf({ data: null })).toEqual({});
    });
  });

  describe('extractOccurredOn', () => {
    it('should rebuild the Date from the ISO string', () => {
      const at = ProbeEvent.occurredOnOf({ occurredOn: FIXED_TIMESTAMP });

      expect(at).toBeInstanceOf(Date);
      expect(at.toISOString()).toBe(FIXED_TIMESTAMP);
    });

    it('should throw when occurredOn is missing', () => {
      // Silently defaulting to now would rewrite history during a replay,
      // so this has to stay a hard failure.
      expect(() => ProbeEvent.occurredOnOf({})).toThrow(
        'Event JSON missing occurredOn field',
      );
      expect(() => ProbeEvent.occurredOnOf({ occurredOn: '' })).toThrow(
        'Event JSON missing occurredOn field',
      );
    });
  });

  describe('metadata accessors', () => {
    it('should expose aggregate identity from the metadata', () => {
      const event = new PingEvent(
        md({ aggregateId: 'cust-9', aggregateType: 'Customer' }),
      );

      expect(event.aggregateId).toBe('cust-9');
      expect(event.aggregateType).toBe('Customer');
      expect(event.aggregateVersion).toBe(1);
    });

    it('should report presence of the optional correlation fields', () => {
      const withAll = new PingEvent(
        md({ correlationId: 'c', causationId: 'x', userId: 'u' }),
      );
      const withNone = new PingEvent(md());

      expect(withAll.hasCorrelationId).toBe(true);
      expect(withAll.hasCausationId).toBe(true);
      expect(withAll.hasUserId).toBe(true);
      expect(withNone.hasCorrelationId).toBe(false);
      expect(withNone.hasCausationId).toBe(false);
      expect(withNone.hasUserId).toBe(false);
    });

    it('should treat an empty string as absent, not present', () => {
      // The accessors coerce with !!, so a mapper that writes '' instead of
      // leaving the field out must not make the event look correlated.
      const event = new PingEvent(
        md({ correlationId: '', causationId: '', userId: '' }),
      );

      expect(event.hasCorrelationId).toBe(false);
      expect(event.hasCausationId).toBe(false);
      expect(event.hasUserId).toBe(false);
    });
  });

  describe('equals', () => {
    it('should compare on eventId', () => {
      const event = new PingEvent(md());

      expect(event.equals(event)).toBe(true);
      expect(event.equals(new PingEvent(md()))).toBe(false);
    });

    it('should treat two events built from the same metadata as different', () => {
      // Event identity is per occurrence, not per aggregate state. Falling
      // back to metadata comparison would collapse a legitimate retry into a
      // single event during deduplication.
      const metadata = md();

      expect(new PingEvent(metadata).equals(new PingEvent(metadata))).toBe(
        false,
      );
    });

    it('should return false for null and undefined', () => {
      const event = new PingEvent(md());

      expect(event.equals(null)).toBe(false);
      expect(event.equals(undefined)).toBe(false);
    });
  });

  describe('belongsToAggregate', () => {
    it('should match the aggregate id exactly', () => {
      const event = new PingEvent(md({ aggregateId: 'order-1' }));

      expect(event.belongsToAggregate('order-1')).toBe(true);
      expect(event.belongsToAggregate('order-2')).toBe(false);
      expect(event.belongsToAggregate('Order-1')).toBe(false);
      expect(event.belongsToAggregate(undefined)).toBe(false);
    });
  });

  describe('isAggregateType', () => {
    it('should match the aggregate type exactly', () => {
      const event = new PingEvent(md({ aggregateType: 'Order' }));

      expect(event.isAggregateType('Order')).toBe(true);
      expect(event.isAggregateType('order')).toBe(false);
      expect(event.isAggregateType('Customer')).toBe(false);
    });
  });
});

describe('AbstractDomainEvent', () => {
  it('should still be the same class as DomainEvent', () => {
    // The deprecated alias is part of the published surface; dropping it or
    // re-declaring it as a separate class breaks existing consumers at
    // import time rather than at compile time.
    expect(AbstractDomainEvent).toBe(DomainEvent);
  });

  it('should produce working events when used as the base class', () => {
    class LegacyEvent extends AbstractDomainEvent {}

    const event = new LegacyEvent(md());

    expect(event).toBeInstanceOf(DomainEvent);
    expect(event.eventType).toBe('LegacyEvent');
    expect(event.aggregateId).toBe('order-1');
  });
});
