import { DefaultDomainEventPublisher } from './default-event-publisher';
import { Subject } from 'rxjs';
import { IDomainEvent } from '../interfaces';

describe('DefaultDomainEventPublisher', () => {
    let subject: Subject<IDomainEvent>;
    let publisher: DefaultDomainEventPublisher<IDomainEvent>;

    beforeEach(() => {
        subject = new Subject<IDomainEvent>();
        publisher = new DefaultDomainEventPublisher(subject);
    });

    it('should publish an event to the subject', (done) => {
        const event: IDomainEvent = {
            // Mock event properties if needed, IDomainEvent usually is empty or has minimal
            timestamp: Date.now()
        } as any;

        subject.subscribe((evt) => {
            expect(evt).toBe(event);
            done();
        });

        publisher.publish(event);
    });

    it('should bridge events to a new subject', (done) => {
        const newSubject = new Subject<IDomainEvent>();
        publisher.bridgeEventsTo(newSubject);

        const event: IDomainEvent = { timestamp: Date.now() } as any;

        newSubject.subscribe((evt) => {
            expect(evt).toBe(event);
            done();
        });

        // Old subject should not receive it (if implementation replaces the reference correctly)
        // Actually implementation is: this.subject$ = subject;
        // So publishing uses the new subject.
        publisher.publish(event);
    });
});
