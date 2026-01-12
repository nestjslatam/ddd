import { DatabaseException } from './database.exception';

describe('DatabaseException', () => {
    it('should create an instance with the correct name and message', () => {
        const message = 'Database error';
        const exception = new DatabaseException(message);

        expect(exception).toBeInstanceOf(Error);
        expect(exception).toBeInstanceOf(DatabaseException);
        expect(exception.message).toBe(message);
        expect(exception.name).toBe('DatabaseException');
    });
});
