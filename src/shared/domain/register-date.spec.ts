import { RegisterDate } from './register-date';

describe('RegisterDate', () => {
    it('should create a valid RegisterDate', () => {
        const date = new Date();
        const rd = RegisterDate.create(date);
        expect(rd.unpack()).toBe(date);
    });

    it('should fail if date is invalid', () => {
        expect(() => RegisterDate.create(null as any)).toThrow();
    });
});
