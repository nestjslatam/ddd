import { Test, TestingModule } from '@nestjs/testing';
import { ChangeFullNameSingerCommandHandler } from './change-fullname-singer.command-handler';
import { SingerRepository } from '../../../../infrastructure/db';
import { DomainEventBus } from '@nestjslatam/ddd-lib';
import { ChangeFullNameSingerCommand } from './change-fullname-singer.command';

jest.mock('../../../../../shared/application/context/meta-context-request.service', () => ({
    MetaRequestContextService: {
        getUser: jest.fn().mockReturnValue('test-user'),
    },
}));

describe('ChangeFullNameSingerCommandHandler', () => {
    let handler: ChangeFullNameSingerCommandHandler;

    const mockSingerRepository = {
        findById: jest.fn(),
        update: jest.fn(),
    };

    const mockEventBus = {
        publish: jest.fn(), // AbstractCommandHandler calls this.publish which uses eventBus
        publishAll: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChangeFullNameSingerCommandHandler,
                { provide: SingerRepository, useValue: mockSingerRepository },
                { provide: DomainEventBus, useValue: mockEventBus },
            ],
        }).compile();

        handler = module.get<ChangeFullNameSingerCommandHandler>(ChangeFullNameSingerCommandHandler);
        jest.clearAllMocks();
    });

    it('should change full name successfully', async () => {
        const command = new ChangeFullNameSingerCommand('id-1', 'New Name', 'track-1');

        const mockSinger = {
            props: {
                audit: { update: jest.fn() }
            },
            changeFullName: jest.fn(),
            BrokenRules: { count: () => 0 },
            IsValid: true,
            DomainEvents: [], // Accessor
            clearDomainEvents: jest.fn() // Called by publish -> commit
        };
        // AbstractCommandHandler.publish calls commit() on aggregate. 
        // We need to ensure mock implements what's needed.

        // Actually, let's mock the 'commit' method if AbstractCommandHandler calls it.
        // Checking AbstractCommandHandler: it likely calls 'commit()' if available or 'getDomainEvents()'.
        // Wait, AbstractCommandHandler usually calls `aggregate.commit()`?
        // Or `this.eventBus.publish(events)`.

        // Let's assume standard behavior. 
        // mockSinger needs to look like an aggregate.
        mockSinger['commit'] = jest.fn().mockReturnValue([]);

        mockSingerRepository.findById.mockResolvedValue(mockSinger);
        mockSingerRepository.update.mockResolvedValue(undefined);

        await handler.execute(command);

        expect(mockSinger.changeFullName).toHaveBeenCalled();
        expect(mockSingerRepository.update).toHaveBeenCalledWith('id-1', mockSinger);
    });
});
