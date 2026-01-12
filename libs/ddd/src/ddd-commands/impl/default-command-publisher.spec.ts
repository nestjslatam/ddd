import { DefaultCommandPublisher } from './default-command-publisher';
import { Subject } from 'rxjs';
import { IDomainCommand } from '../interfaces';

describe('DefaultCommandPublisher', () => {
    let subject: Subject<IDomainCommand>;
    let publisher: DefaultCommandPublisher<IDomainCommand>;

    beforeEach(() => {
        subject = new Subject<IDomainCommand>();
        publisher = new DefaultCommandPublisher(subject);
    });

    it('should publish a command to the subject', (done) => {
        const command: IDomainCommand = {
            metadata: { id: 'cmd-1', trackingId: 'tr-1' },
        };

        subject.subscribe((cmd) => {
            expect(cmd).toBe(command);
            done();
        });

        publisher.publish(command);
    });
});
