import { Test, TestingModule } from '@nestjs/testing';
import { RemoveSongToSingerCommandHandler } from './remove-song-singer.command-handler';
import { SingerRepository, SongRepository } from '../../../../infrastructure/db';
import { DomainEventBus } from '@nestjslatam/ddd-lib';
import { RemoveSongToSingerCommand } from './remove-song-singer.command';

jest.mock('../../../../../shared/application/context/meta-context-request.service', () => ({
    MetaRequestContextService: {
        getUser: jest.fn().mockReturnValue('test-user'),
    },
}));

describe('RemoveSongToSingerCommandHandler', () => {
    let handler: RemoveSongToSingerCommandHandler;

    const mockSingerRepository = {
        findById: jest.fn(),
        removeSong: jest.fn(),
    };

    const mockSongRepository = {
        findById: jest.fn(),
    };

    const mockEventBus = {
        publish: jest.fn(),
        publishAll: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RemoveSongToSingerCommandHandler,
                { provide: SingerRepository, useValue: mockSingerRepository },
                { provide: SongRepository, useValue: mockSongRepository },
                { provide: DomainEventBus, useValue: mockEventBus },
            ],
        }).compile();

        handler = module.get<RemoveSongToSingerCommandHandler>(RemoveSongToSingerCommandHandler);
        jest.clearAllMocks();
    });

    it('should remove song successfully', async () => {
        const command = new RemoveSongToSingerCommand('singer-1', 'song-1', 'track');

        const mockSinger = {
            props: {
                audit: { update: jest.fn().mockReturnValue({}) }
            },
            removeSong: jest.fn(),
            BrokenRules: { count: () => 0 },
            IsValid: true,
            DomainEvents: [],
            clearDomainEvents: jest.fn(),
            commit: jest.fn().mockReturnValue([])
        };

        const mockSong = { id: 'song-1' };

        mockSingerRepository.findById.mockResolvedValue(mockSinger);
        mockSongRepository.findById.mockResolvedValue(mockSong);
        mockSingerRepository.removeSong.mockResolvedValue(undefined);

        await handler.execute(command);

        expect(mockSinger.removeSong).toHaveBeenCalledWith(mockSong, expect.anything());
        expect(mockSingerRepository.removeSong).toHaveBeenCalledWith(mockSinger, mockSong);
    });
});
