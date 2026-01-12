import { Test, TestingModule } from '@nestjs/testing';
import { AddSongToSingerCommandHandler } from './add-song-singer.command-handler';
import { SingerRepository } from '../../../../infrastructure/db';
import { DomainEventBus } from '@nestjslatam/ddd-lib';
import { AddSongToSingerCommand } from './add-song-singer.command';
import { Id, MetaRequestContextService } from '../../../../../shared';
import { Singer } from '../../../../domain';

// Mock dependencies
const mockSingerRepository = {
    findById: jest.fn(),
    addSong: jest.fn(),
};

const mockEventBus = {
    publish: jest.fn(),
    publishAll: jest.fn(),
};

jest.mock('../../../../../shared/application/context/meta-context-request.service', () => ({
    MetaRequestContextService: {
        getUser: jest.fn().mockReturnValue('test-user'),
    },
}));

describe('AddSongToSingerCommandHandler', () => {
    let handler: AddSongToSingerCommandHandler;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AddSongToSingerCommandHandler,
                { provide: SingerRepository, useValue: mockSingerRepository },
                { provide: DomainEventBus, useValue: mockEventBus },
            ],
        }).compile();

        handler = module.get<AddSongToSingerCommandHandler>(AddSongToSingerCommandHandler);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    it('should add song to singer successfully', async () => {
        const command = new AddSongToSingerCommand(Id.create().unpack(), 'New Song', 'track-1');

        // Mock singer instance
        const mockSinger = {
            addSong: jest.fn(),
            props: {
                audit: { update: jest.fn() }
            },
            BrokenRules: { count: () => 0 }, // For checkBusinessRules
            IsValid: true,
        };
        mockSingerRepository.findById.mockResolvedValue(mockSinger);

        await handler.execute(command);

        expect(mockSingerRepository.findById).toHaveBeenCalledWith(command.id);
        expect(mockSinger.addSong).toHaveBeenCalled();
        expect(mockSingerRepository.addSong).toHaveBeenCalledWith(mockSinger, expect.anything());
    });

    it('should throw if singer not found', async () => {
        const command = new AddSongToSingerCommand(Id.create().unpack(), 'Song', 'track-1');
        mockSingerRepository.findById.mockResolvedValue(null);

        await expect(handler.execute(command)).rejects.toThrow('Singer not found');
    });
});
