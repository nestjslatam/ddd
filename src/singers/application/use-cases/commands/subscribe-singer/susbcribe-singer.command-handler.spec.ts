import { Test, TestingModule } from '@nestjs/testing';
import { SubscribeSingerCommandHandler } from './susbcribe-singer.command-handler';
import { SingerRepository } from '../../../../infrastructure/db';
import { DomainEventBus } from '@nestjslatam/ddd-lib';
import { SubscribeSingerCommand } from './susbcribe-singer.command';

jest.mock('../../../../../shared/application/context/meta-context-request.service', () => ({
    MetaRequestContextService: {
        getUser: jest.fn().mockReturnValue('test-user'),
    },
}));

describe('SubscribeSingerCommandHandler', () => {
    let handler: SubscribeSingerCommandHandler;

    const mockSingerRepository = {
        findById: jest.fn(),
        update: jest.fn(),
    };

    const mockEventBus = {
        publish: jest.fn(),
        publishAll: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubscribeSingerCommandHandler,
                { provide: SingerRepository, useValue: mockSingerRepository },
                { provide: DomainEventBus, useValue: mockEventBus },
            ],
        }).compile();

        handler = module.get<SubscribeSingerCommandHandler>(SubscribeSingerCommandHandler);
        jest.clearAllMocks();
    });

    it('should subscribe singer successfully', async () => {
        const command = new SubscribeSingerCommand('id-1', 'track');

        const mockSinger = {
            props: {
                audit: { update: jest.fn().mockReturnValue({}) }
            },
            subscribe: jest.fn(),
            BrokenRules: { count: () => 0 },
            IsValid: true,
            DomainEvents: [],
            clearDomainEvents: jest.fn(),
            commit: jest.fn().mockReturnValue([])
        };

        mockSingerRepository.findById.mockResolvedValue(mockSinger);
        mockSingerRepository.update.mockResolvedValue(undefined);

        await handler.execute(command);

        expect(mockSinger.subscribe).toHaveBeenCalled();
        expect(mockSingerRepository.update).toHaveBeenCalledWith('id-1', mockSinger);
    });
});
