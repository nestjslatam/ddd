import { DomainAggregateRoot } from './ddd-aggregate-root';
import { DomainUid } from './ddd-valueobjects';
import { TrackingProps, ITrackingProps } from './ddd-core';
import { IDomainEvent, ISerializableEvent } from './ddd-events';
import * as crypto from 'crypto';

// Mock event
class TestEvent implements IDomainEvent {
  constructor(public readonly aggregateId: string) {}
}

// Mock Aggregate Root
class TestAggregate extends DomainAggregateRoot<{ prop1: string }> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected businessRules(_props: { prop1: string }): void {}

  constructor(
    id: DomainUid,
    props: { prop1: string },
    trackingProps: ITrackingProps,
  ) {
    super(id, props, trackingProps);
  }

  applyTestEvent() {
    this.apply(new TestEvent(this.id));
  }

  get events() {
    return this.DomainEvents;
  }
}

describe('DomainAggregateRoot', () => {
  let trackingProps: ITrackingProps;

  beforeEach(() => {
    trackingProps = TrackingProps.setNew();
  });

  const createTestAggregate = () => {
    return new TestAggregate(
      DomainUid.create(crypto.randomUUID()),
      { prop1: 'test' },
      trackingProps,
    );
  };

  it('should be defined', () => {
    expect(createTestAggregate()).toBeDefined();
  });

  it('should have a default version of 0', () => {
    const aggregate = createTestAggregate();
    expect(aggregate.version).toBe(0);
  });

  it('should start with no domain events', () => {
    const aggregate = createTestAggregate();
    expect(aggregate.events).toHaveLength(0);
  });

  it('should add a domain event when apply is called', () => {
    const aggregate = createTestAggregate();
    aggregate.applyTestEvent();
    expect(aggregate.events).toHaveLength(1);
    expect(aggregate.events[0]).toBeInstanceOf(TestEvent);
  });

  it('should not add a domain event when autoCommit is true', () => {
    const aggregate = createTestAggregate();
    aggregate.autoCommit = true;
    aggregate.applyTestEvent();
    expect(aggregate.events).toHaveLength(0);
  });

  it('should clear domain events on commit', () => {
    const aggregate = createTestAggregate();
    aggregate.applyTestEvent();
    const events = aggregate.commit();
    expect(events).toHaveLength(1);
    expect(aggregate.events).toHaveLength(0);
  });

  it('should load from history and apply events', () => {
    const aggregate = createTestAggregate();
    const history: ISerializableEvent[] = [
      {
        aggregateId: aggregate.id,
        type: 'TestEvent',
        data: new TestEvent(aggregate.id),
        position: 1,
      },
      {
        aggregateId: aggregate.id,
        type: 'TestEvent',
        data: new TestEvent(aggregate.id),
        position: 2,
      },
    ];

    // Mock the event handler
    const applyEventFromHistorySpy = jest.spyOn(
      aggregate as any,
      'applyEventFromHistory',
    );

    aggregate.loadFromHistory(history);

    expect(applyEventFromHistorySpy).toHaveBeenCalledTimes(2);
    expect(aggregate.version).toBe(2);
    expect(aggregate.events).toHaveLength(0); // Should not add to domainEvents
  });

  it('should add and remove a domain event', () => {
    const aggregate = createTestAggregate();
    const event = new TestEvent(aggregate.id);

    aggregate.addDomainEvent(event);
    expect(aggregate.events).toHaveLength(1);

    aggregate.removeDomainEvent(event);
    expect(aggregate.events).toHaveLength(0);
  });

  it('should not add a duplicate domain event', () => {
    const aggregate = createTestAggregate();
    const event = new TestEvent(aggregate.id);

    aggregate.addDomainEvent(event);
    aggregate.addDomainEvent(event);

    expect(aggregate.events).toHaveLength(1);
  });
});
