import { DomainAudit, IDomainAuditProps } from './domain-audit.valueobject';

describe('DomainAudit', () => {
    const validProps: IDomainAuditProps = {
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedBy: 'user-456',
        updatedAt: new Date(),
    };

    it('should create a valid DomainAudit instance', () => {
        const audit = DomainAudit.create(validProps);
        expect(audit.isValid).toBeTruthy();
        expect(audit.CreatedBy).toBe(validProps.createdBy);
        expect(audit.CreatedAt).toBe(validProps.createdAt);
        expect(audit.UpdatedBy).toBe(validProps.updatedBy);
        expect(audit.UpdatedAt).toBe(validProps.updatedAt);
        expect(audit.TimeStamp).toBeDefined();
    });

    it('should create a valid DomainAudit instance without optional props', () => {
        const props: IDomainAuditProps = {
            createdBy: 'user-123',
            createdAt: new Date(),
        };
        const audit = DomainAudit.create(props);
        expect(audit.isValid).toBeTruthy();
        expect(audit.CreatedBy).toBe(props.createdBy);
        expect(audit.CreatedAt).toBe(props.createdAt);
        expect(audit.UpdatedBy).toBeUndefined();
        expect(audit.UpdatedAt).toBeUndefined();
    });

    it('should fail if createdBy is invalid', () => {
        const props = { ...validProps, createdBy: '' };
        expect(() => DomainAudit.create(props)).toThrow();
    });

    it('should fail if createdAt is invalid', () => {
        const props = { ...validProps, createdAt: null as any };
        expect(() => DomainAudit.create(props)).toThrow();
    });

    it('should fail if updatedBy is provided but invalid', () => {
        const props = { ...validProps, updatedBy: '' };
        expect(() => DomainAudit.create(props)).toThrow();
    });

    it('should fail if updatedAt is provided but invalid', () => {
        const props = { ...validProps, updatedAt: 'invalid-date' as any };
        expect(() => DomainAudit.create(props)).toThrow();
    });

    it('should update audit fields correctly', () => {
        const audit = DomainAudit.create(validProps);
        const newDate = new Date();
        audit.update('new-user', newDate);

        expect(audit.UpdatedBy).toBe('new-user');
        expect(audit.UpdatedAt).toBe(newDate);
        expect(audit.TimeStamp).toBeDefined();
    });

    it('should get raw props', () => {
        const audit = DomainAudit.create(validProps);
        expect(audit.getRaw()).toEqual(expect.objectContaining(validProps));
    });

    it('should create from raw props', () => {
        const audit = DomainAudit.getFromRaw(validProps);
        expect(audit.isValid).toBeTruthy();
        expect(audit.getRaw()).toEqual(expect.objectContaining(validProps));
    });
});
