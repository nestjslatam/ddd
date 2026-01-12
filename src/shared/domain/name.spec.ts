import { Name } from './name';

describe('Name', () => {
    it('should create a valid Name', () => {
        const name = Name.create('John Doe');
        expect(name.unpack()).toBe('John Doe');
    });

    it('should fail if name is not a string (base validation)', () => {
        expect(() => Name.create(null as any)).toThrow();
    });
});
