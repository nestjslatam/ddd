import { Test, TestingModule } from '@nestjs/testing';
import { RemoveSongToSingerController } from './remove-song-singer.controller';
import { CommandBus } from '@nestjs/cqrs';
import { RemoveSongToSingerDto } from './remove-song-singer.dto';
import { RemoveSongToSingerCommand } from './remove-song-singer.command';

describe('RemoveSongToSingerController', () => {
    let controller: RemoveSongToSingerController;
    let commandBus: CommandBus;

    const mockCommandBus = {
        execute: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RemoveSongToSingerController],
            providers: [
                { provide: CommandBus, useValue: mockCommandBus },
            ],
        }).compile();

        controller = module.get<RemoveSongToSingerController>(RemoveSongToSingerController);
        commandBus = module.get<CommandBus>(CommandBus);
        jest.clearAllMocks();
    });

    it('should execute command', async () => {
        const dto = new RemoveSongToSingerDto();
        dto.singerId = 'singer-1';
        dto.songId = 'song-1';

        await controller.RemoveSong(dto);

        expect(commandBus.execute).toHaveBeenCalledWith(expect.any(RemoveSongToSingerCommand));
    });

    it('should return if dto is missing', async () => {
        await controller.RemoveSong(undefined as any);
        expect(commandBus.execute).not.toHaveBeenCalled();
    });
});
