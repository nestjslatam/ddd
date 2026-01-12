import { Id } from './id';

describe('Id', () => {
    it('should create a valid Id', () => {
        const id = Id.create();
        expect(id).toBeDefined();
        // Assuming DomainUid validation (UUID v4) checks out
        expect(id.unpack()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should create from raw string', () => {
        const uuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
        const id = Id.fromRaw(uuid);
        expect(id.unpack()).toBe(uuid);
    });

    it('should load from string', () => {
        const uuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
        const id = Id.load(uuid);
        expect(id.unpack()).toBe(uuid);
    });
});
