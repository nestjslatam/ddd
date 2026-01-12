import { ApplicationException } from './application.exception';

describe('ApplicationException', () => {
    it('should create an instance with the correct name and message', () => {
        const message = 'Something went wrong';
        const exception = new ApplicationException(message);

        expect(exception).toBeInstanceOf(Error);
        expect(exception).toBeInstanceOf(ApplicationException);
        expect(exception.message).toBe(message);
        expect(exception.name).toBe('ApplicationException');
    });
});
