import { DomainEventSerializer } from './domain-event.serializer';
import { DomainAggregateRoot } from '../../ddd-aggregate-root';
import { DomainUid } from '../../ddd-valueobjects';

describe('DomainEventSerializer', () => {
    let serializer: DomainEventSerializer;

    beforeEach(() => {
        serializer = new DomainEventSerializer();
    });

    it('should serialize a simple event', () => {
        class TestEvent {
            constructor(public readonly foo: string) { }
        }
        const event = new TestEvent('bar');

        const mockAggregate = {
            id: 'd8616196-981c-4389-a299-4d8304918454',
            version: 1,
        } as any as DomainAggregateRoot<any>;

        const result = serializer.serialize(event, mockAggregate);

        expect(result.aggregateId).toBe('d8616196-981c-4389-a299-4d8304918454');
        expect(result.position).toBe(2);
        expect(result.type).toBe('TestEvent');
        expect(result.data).toEqual({ foo: 'bar' });
    });

    it('should throw if event type cannot be determined', () => {
        const mockAggregate = { id: DomainUid.create('d8616196-981c-4389-a299-4d8304918454'), version: 1 } as any;

        const event = Object.create(null);
        expect(() => serializer.serialize(event, mockAggregate)).toThrow('Incompatible event type');
    });

    it('should handle toJSON method if present', () => {
        class CustomEvent {
            toJSON() { return { custom: 'serialized' }; }
        }
        const evt = new CustomEvent();
        // Mock Aggregate with different ID to vary
        const mockAggregate = {
            id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            version: 0,
        } as any;

        const res = serializer.serialize(evt, mockAggregate);
        expect(res.data).toEqual({ custom: 'serialized' });
    });
});
