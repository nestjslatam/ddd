import { Test, TestingModule } from '@nestjs/testing';
import { AddSongToSingerController } from './add-song-singer.controller';
import { CommandBus } from '@nestjs/cqrs';
import { AddSongToSingerDto } from './add-song-singer.dto';
import { AddSongToSingerCommand } from './add-song-singer.command';

describe('AddSongToSingerController', () => {
    let controller: AddSongToSingerController;
    let commandBus: CommandBus;

    const mockCommandBus = {
        execute: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AddSongToSingerController],
            providers: [
                { provide: CommandBus, useValue: mockCommandBus },
            ],
        }).compile();

        controller = module.get<AddSongToSingerController>(AddSongToSingerController);
        commandBus = module.get<CommandBus>(CommandBus);
        jest.clearAllMocks();
    });

    it('should execute command', async () => {
        const dto = new AddSongToSingerDto();
        dto.songName = 'Song 1';
        dto.trackingId = 'track-1';
        const id = 'singer-1';

        await controller.addSong(id, dto);

        expect(commandBus.execute).toHaveBeenCalledWith(expect.any(AddSongToSingerCommand));
    });

    it('should return undefined if dto is missing', async () => {
        const result = await controller.addSong('id', undefined as any);
        expect(result).toBeUndefined();
        expect(commandBus.execute).not.toHaveBeenCalled();
    });
});
