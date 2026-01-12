import { AbstractDomainNumber } from './domain-number-base.valueobject';
import { IDomainPrimitive } from '../ddd-core/ddd-base-classes';

class TestDomainNumber extends AbstractDomainNumber {
    constructor(value: number) {
        super(value);
    }
    protected businessRules(_props: IDomainPrimitive<number>): void {
        // no-op
    }
}

describe('AbstractDomainNumber', () => {
    it('should create a valid number instance', () => {
        const num = new TestDomainNumber(42);
        expect(num.isValid).toBeTruthy();
        expect(num.unpack()).toBe(42);
    });

    it('should fail if value is not a number', () => {
        // Cannot easily pass non-number in TS without cast, but runtime check exists
        expect(() => new TestDomainNumber('42' as any)).toThrow();
    });

    it('should fail if value is null', () => {
        expect(() => new TestDomainNumber(null as any)).toThrow();
    });
});
