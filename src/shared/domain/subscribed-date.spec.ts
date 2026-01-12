import { SubscribedDate } from './subscribed-date';

describe('SubscribedDate', () => {
    it('should create a valid SubscribedDate', () => {
        const date = new Date();
        const sd = SubscribedDate.create(date);
        expect(sd.unpack()).toBe(date);
    });

    it('should fail if date is invalid', () => {
        expect(() => SubscribedDate.create(null as any)).toThrow();
    });
});
