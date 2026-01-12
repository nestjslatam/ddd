import { DomainEnum } from './domain-enum-base.valueobject';

describe('DomainEnum', () => {
    it('should create a valid instance', () => {
        const validValues = ['A', 'B', 'C'];
        const enumVO = new DomainEnum('A', validValues);
        expect(enumVO.value).toBe('A');
        expect(enumVO.validValues).toEqual(validValues);
    });

    // Note: Current implementation does not validate membership in constructor.
    // We strictly test what is implemented. 
});
