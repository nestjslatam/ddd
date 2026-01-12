import { Singer } from './singer';
import { FullName } from './fullname-field';
import { PicturePath } from './picture-field';
import { eSingerStatus } from './interfaces';
import { Id, RegisterDate, SubscribedDate } from '../../shared';
import { DomainAudit, BrokenRulesException } from '@nestjslatam/ddd-lib';
import { SingerCreatedDomainEvent, SingerSubscribedDomainEvent, SingerDeletedDomainEvent } from './events';
import { Song } from './song';

describe('Singer', () => {
    const validAudit = {
        updatedAt: new Date(),
        updatedBy: 'admin',
        createdAt: new Date(),
        createdBy: 'admin'
    };

    const validProps = {
        fullName: FullName.create('John Doe'),
        picture: PicturePath.create('http://pic.com/1.jpg'),
        registerDate: RegisterDate.create(new Date()),
        isSubscribed: false,
        subscribedDate: null,
        songs: [],
        status: eSingerStatus.Registered,
        audit: DomainAudit.create(validAudit),
    };

    it('should create new Singer and raise SingerCreatedDomainEvent', () => {
        const singer = Singer.create(validProps);

        expect(singer).toBeDefined();
        // Singer extends DomainEntity which exposes 'id' getter
        expect(singer.id).toBeDefined();

        // Use 'DomainEvents' getter (capitalized)
        expect(singer.DomainEvents).toHaveLength(1);
        expect(singer.DomainEvents[0]).toBeInstanceOf(SingerCreatedDomainEvent);
    });

    it('should subscribe and raise event', () => {
        const singer = Singer.create(validProps);
        singer.clearDomainEvents(); // Correct method name

        singer.subscribe(DomainAudit.create(validAudit));

        // Use 'props' getter exposed by DomainEntity
        expect(singer.props.isSubscribed).toBe(true);
        expect(singer.props.status).toBe(eSingerStatus.Subscribed);

        expect(singer.DomainEvents).toHaveLength(1);
        expect(singer.DomainEvents[0]).toBeInstanceOf(SingerSubscribedDomainEvent);
    });

    it('should throw if subscribing already subscribed singer', () => {
        const singer = Singer.create(validProps);
        singer.subscribe(DomainAudit.create(validAudit));

        expect(() => singer.subscribe(DomainAudit.create(validAudit))).toThrow(BrokenRulesException);
    });

    it('should map from raw', () => {
        const id = Id.create();
        const raw = {
            id: id.unpack(),
            fullName: 'Jane Doe',
            picture: 'http://pic.com/2.jpg',
            registerDate: new Date(),
            isSubscribed: true,
            subscribedDate: new Date(),
            songs: [],
            status: 'Registered', // Pass string as expected by mapFromRaw potentially?
            // Wait, mapFromRaw uses eSingerStatus[status]. 
            // If status is string 'Registered', result is undefined (unless reverse map works).
            // Logic: `status: eSingerStatus[status]`
            // If raw.status comes from DB as string "registered", and enum is string enum:
            // eSingerStatus["registered"] -> undefined usually for string enums!
            // String enums do NOT have reverse mapping.
            // Let's assume logic implies raw.status is Key? Or maybe generic object access?
            // If logic is `eSingerStatus["Registered"]` -> 'registered'.
            // So if I pass 'Registered' (Key), it works.
            audit: { updatedAt: new Date(), updatedBy: 'user', createdAt: new Date(), createdBy: 'user' }
        };

        // TS enum reverse mapping only works for numeric enums.
        // If string enum, eSingerStatus[key] works if key matches member name.
        // eSingerStatus.Registered = 'registered'.
        // eSingerStatus['Registered'] exists? No, unless compiled to object.
        // Actually, let's look at `singer.ts` again: `status: eSingerStatus[status]`.
        // If `status` is type string in ISingerRaw. 
        // If I pass 'Registered', does it work?
        // Let's try passing 'Registered'. If it fails, I'll know logic is flawed or needs 'registered'.

        const singer = Singer.mapFromRaw(raw);
        expect(singer.id).toBe(id.unpack());
    });

    it('should update fullname', () => {
        const singer = Singer.create(validProps);
        singer.changeFullName(FullName.create('New Name'), DomainAudit.create(validAudit));
        expect(singer.props.fullName.unpack()).toBe('New Name');
    });

    it('should update picture', () => {
        const singer = Singer.create(validProps);
        singer.changePicture(PicturePath.create('http://new.com'), DomainAudit.create(validAudit));
        expect(singer.props.picture.unpack()).toBe('http://new.com');
    });

    it('should remove singer', () => {
        const singer = Singer.create(validProps);
        singer.clearDomainEvents();
        singer.remove(DomainAudit.create(validAudit));

        expect(singer.props.status).toBe(eSingerStatus.Deleted);
        expect(singer.DomainEvents).toHaveLength(1);
        expect(singer.DomainEvents[0]).toBeInstanceOf(SingerDeletedDomainEvent);
    });

    it('should NOT remove singer if subscribed', () => {
        const singer = Singer.create(validProps);
        singer.subscribe(DomainAudit.create(validAudit));
        singer.clearDomainEvents();

        expect(() => singer.remove(DomainAudit.create(validAudit))).toThrow(BrokenRulesException);
    });
});
