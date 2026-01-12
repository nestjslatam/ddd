import { FullName } from './fullname-field';
import { BrokenRulesException } from '@nestjslatam/ddd-lib';

describe('FullName', () => {
    it('should create valid FullName', () => {
        const name = FullName.create('John Doe');
        expect(name.unpack()).toBe('John Doe');
    });

    it('should throw if name is too short', () => {
        expect(() => FullName.create('Jo')).toThrow(BrokenRulesException);
        expect(() => FullName.create('Jo')).toThrow(/greater than 3 characters/);
    });

    it('should throw if name is too long', () => {
        expect(() => FullName.create('a'.repeat(301))).toThrow(BrokenRulesException);
        expect(() => FullName.create('a'.repeat(301))).toThrow(/less than 300 characters/);
    });
});
