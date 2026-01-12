import { PicturePath } from './picture-field';
import { BrokenRulesException } from '@nestjslatam/ddd-lib';

describe('PicturePath', () => {
    it('should create valid PicturePath', () => {
        const path = PicturePath.create('http://example.com/pic.jpg');
        expect(path.unpack()).toBe('http://example.com/pic.jpg');
    });

    it('should throw if path is too short', () => {
        expect(() => PicturePath.create('hi')).toThrow(BrokenRulesException);
        expect(() => PicturePath.create('hi')).toThrow(/greater than 3 characters/);
    });

    it('should throw if path is too long', () => {
        expect(() => PicturePath.create('a'.repeat(2801))).toThrow(BrokenRulesException);
        expect(() => PicturePath.create('a'.repeat(2801))).toThrow(/less than 2800 characters/);
    });
});
