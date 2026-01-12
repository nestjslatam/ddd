import { Test, TestingModule } from '@nestjs/testing';
import { ChangePictureSingerController } from './change-picture-singer.controller';
import { CommandBus } from '@nestjs/cqrs';
import { ChangePictureSingerDto } from './change-picture-singer.dto';
import { ChangePictureSingerCommand } from './change-picture-singer.command';

describe('ChangePictureSingerController', () => {
    let controller: ChangePictureSingerController;
    let commandBus: CommandBus;

    const mockCommandBus = {
        execute: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChangePictureSingerController],
            providers: [
                { provide: CommandBus, useValue: mockCommandBus },
            ],
        }).compile();

        controller = module.get<ChangePictureSingerController>(ChangePictureSingerController);
        commandBus = module.get<CommandBus>(CommandBus);
        jest.clearAllMocks();
    });

    it('should execute command', async () => {
        const dto = new ChangePictureSingerDto();
        dto.newPicture = 'http://pic.com';
        dto.trackingId = 'track';

        await controller.changePicture('id-1', dto);

        expect(commandBus.execute).toHaveBeenCalledWith(expect.any(ChangePictureSingerCommand));
    });

    it('should return if dto is missing', async () => {
        await controller.changePicture('id-1', undefined as any);
        expect(commandBus.execute).not.toHaveBeenCalled();
    });
});
