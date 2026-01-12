import { AbstractDomainString } from './domain-string-base.valueobject';
import { IDomainPrimitive } from '../ddd-core/ddd-base-classes';

class TestDomainString extends AbstractDomainString {
    constructor(value: string) {
        super(value);
    }
    protected businessRules(_props: IDomainPrimitive<string>): void {
        // no-op
    }
}

describe('AbstractDomainString', () => {
    it('should create a valid string instance', () => {
        const str = new TestDomainString('hello');
        expect(str.isValid).toBeTruthy();
        expect(str.unpack()).toBe('hello');
    });

    it('should fail if value is not a string', () => {
        expect(() => new TestDomainString(123 as any)).toThrow();
    });

    it('should fail if value is null', () => {
        expect(() => new TestDomainString(null as any)).toThrow();
    });
});
