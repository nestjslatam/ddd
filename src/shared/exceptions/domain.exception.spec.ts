import { DomainException } from './domain.exception';

describe('DomainException', () => {
    it('should create an instance with the correct name and message', () => {
        const message = 'Domain error';
        const exception = new DomainException(message);

        expect(exception).toBeInstanceOf(Error);
        expect(exception).toBeInstanceOf(DomainException);
        expect(exception.message).toBe(message);
        expect(exception.name).toBe('DomainException');
    });
});
