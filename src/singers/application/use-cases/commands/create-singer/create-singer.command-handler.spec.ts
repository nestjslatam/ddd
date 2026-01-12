import { Test, TestingModule } from '@nestjs/testing';
import { CreateSingerCommandHandler } from './create-singer.command-handler';
import { SingerRepository } from '../../../../infrastructure/db';
import { DomainEventBus } from '@nestjslatam/ddd-lib';
import { CreateSingerCommand } from './create-singer.command';
import { Singer } from '../../../../domain';
import { ApplicationException } from '../../../../../shared';

jest.mock('../../../../../shared/application/context/meta-context-request.service', () => ({
    MetaRequestContextService: {
        getUser: jest.fn().mockReturnValue('test-user'),
    },
}));

describe('CreateSingerCommandHandler', () => {
    let handler: CreateSingerCommandHandler;

    const mockSingerRepository = {
        exists: jest.fn(),
        insert: jest.fn(),
    };

    const mockEventBus = {
        publish: jest.fn(),
        publishAll: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateSingerCommandHandler,
                { provide: SingerRepository, useValue: mockSingerRepository },
                { provide: DomainEventBus, useValue: mockEventBus },
            ],
        }).compile();

        handler = module.get<CreateSingerCommandHandler>(CreateSingerCommandHandler);
        jest.clearAllMocks();
    });

    it('should create singer successfully', async () => {
        const command = new CreateSingerCommand('John Doe', 'http://pic.com', 'track');
        mockSingerRepository.exists.mockResolvedValue(false);
        mockSingerRepository.insert.mockResolvedValue(undefined);

        await handler.execute(command);

        expect(mockSingerRepository.exists).toHaveBeenCalledWith(command.fullName);
        expect(mockSingerRepository.insert).toHaveBeenCalledWith(expect.any(Singer));
    });

    it('should throw if singer already exists', async () => {
        const command = new CreateSingerCommand('John Doe', 'http://pic.com', 'track');
        mockSingerRepository.exists.mockResolvedValue(true);

        await expect(handler.execute(command)).rejects.toThrow(ApplicationException);
    });
});
