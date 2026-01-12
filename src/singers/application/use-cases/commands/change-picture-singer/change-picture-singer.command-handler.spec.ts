import { Test, TestingModule } from '@nestjs/testing';
import { ChangePictureSingerCommandHandler } from './change-picture-singer.command-handler';
import { SingerRepository } from '../../../../infrastructure/db';
import { DomainEventBus } from '@nestjslatam/ddd-lib';
import { ChangePictureSingerCommand } from './change-picture-singer.command';
import { PicturePath } from '../../../../domain';

jest.mock('../../../../../shared/application/context/meta-context-request.service', () => ({
    MetaRequestContextService: {
        getUser: jest.fn().mockReturnValue('test-user'),
    },
}));

describe('ChangePictureSingerCommandHandler', () => {
    let handler: ChangePictureSingerCommandHandler;

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
                ChangePictureSingerCommandHandler,
                { provide: SingerRepository, useValue: mockSingerRepository },
                { provide: DomainEventBus, useValue: mockEventBus },
            ],
        }).compile();

        handler = module.get<ChangePictureSingerCommandHandler>(ChangePictureSingerCommandHandler);
        jest.clearAllMocks();
    });

    it('should change picture successfully', async () => {
        const command = new ChangePictureSingerCommand('id-1', 'http://pic.com/1.jpg', 'track-1');

        const mockSinger = {
            props: {
                audit: { update: jest.fn() }
            },
            changePicture: jest.fn(),
            BrokenRules: { count: () => 0 },
            IsValid: true,
            DomainEvents: [],
            clearDomainEvents: jest.fn(),
            commit: jest.fn().mockReturnValue([])
        };

        mockSingerRepository.findById.mockResolvedValue(mockSinger);
        mockSingerRepository.update.mockResolvedValue(undefined);

        await handler.execute(command);

        expect(mockSinger.changePicture).toHaveBeenCalled();
        expect(mockSingerRepository.update).toHaveBeenCalledWith('id-1', mockSinger);
    });
});
