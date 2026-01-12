import { DomainUid } from './domain-uid.valueobject';

describe('DomainUid', () => {
    const validUuid = 'd8616196-981c-4389-a299-4d8304918454';
    const invalidUuid = 'invalid-uuid';

    it('should create a valid DomainUid instance', () => {
        const uid = DomainUid.create(validUuid);
        expect(uid.isValid).toBeTruthy();
        expect(uid.unpack()).toBe(validUuid);
    });

    it('should load a valid DomainUid instance', () => {
        const uid = DomainUid.load(validUuid);
        expect(uid.isValid).toBeTruthy();
        expect(uid.unpack()).toBe(validUuid);
    });

    it('should fail if value is null or undefined', () => {
        expect(() => DomainUid.create(null as any)).toThrow();
    });

    it('should fail if value is not a valid UUID v4', () => {
        expect(() => DomainUid.create(invalidUuid)).toThrow();
    });
});
