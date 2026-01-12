import { Test, TestingModule } from '@nestjs/testing';
import { RemoveSingerCommandHandler } from './remove-singer.command-handler';
import { SingerRepository } from '../../../../infrastructure/db';
import { DomainEventBus } from '@nestjslatam/ddd-lib';
import { RemoveSingerCommand } from './remove-singer.command';
import { ApplicationException } from '../../../../../shared';

jest.mock('../../../../../shared/application/context/meta-context-request.service', () => ({
    MetaRequestContextService: {
        getUser: jest.fn().mockReturnValue('test-user'),
    },
}));

describe('RemoveSingerCommandHandler', () => {
    let handler: RemoveSingerCommandHandler;

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
                RemoveSingerCommandHandler,
                { provide: SingerRepository, useValue: mockSingerRepository },
                { provide: DomainEventBus, useValue: mockEventBus },
            ],
        }).compile();

        handler = module.get<RemoveSingerCommandHandler>(RemoveSingerCommandHandler);
        jest.clearAllMocks();
    });

    it('should remove singer successfully', async () => {
        const command = new RemoveSingerCommand('id-1');

        const mockSinger = {
            props: {
                audit: { update: jest.fn() }
            },
            remove: jest.fn(),
            BrokenRules: { count: () => 0 },
            IsValid: true,
            DomainEvents: [],
            clearDomainEvents: jest.fn(),
            commit: jest.fn().mockReturnValue([])
        };

        mockSingerRepository.findById.mockResolvedValue(mockSinger);
        mockSingerRepository.update.mockResolvedValue(undefined);

        await handler.execute(command);

        expect(mockSinger.remove).toHaveBeenCalled();
        expect(mockSingerRepository.update).toHaveBeenCalledWith('id-1', mockSinger);
    });

    it('should throw if singer not found', async () => {
        const command = new RemoveSingerCommand('id-1');
        mockSingerRepository.findById.mockResolvedValue(null);

        await expect(handler.execute(command)).rejects.toThrow(ApplicationException);
    });
});
