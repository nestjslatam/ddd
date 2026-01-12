import { Url } from './url';

describe('Url', () => {
    it('should create a valid Url', () => {
        const url = Url.create('https://example.com');
        expect(url.unpack()).toBe('https://example.com');
    });

    it('should fail if url is not a string', () => {
        expect(() => Url.create(null as any)).toThrow();
    });
});
