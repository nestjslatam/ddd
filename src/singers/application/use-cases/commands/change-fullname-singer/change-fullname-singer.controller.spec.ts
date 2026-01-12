import { Test, TestingModule } from '@nestjs/testing';
import { ChangeFullNameSingerController } from './change-fullname-singer.controller';
import { CommandBus } from '@nestjs/cqrs';
import { ChangeFullNameSingerDto } from './change-fullname-singer.dto';
import { ChangeFullNameSingerCommand } from './change-fullname-singer.command';

describe('ChangeFullNameSingerController', () => {
    let controller: ChangeFullNameSingerController;
    let commandBus: CommandBus;

    const mockCommandBus = {
        execute: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChangeFullNameSingerController],
            providers: [
                { provide: CommandBus, useValue: mockCommandBus },
            ],
        }).compile();

        controller = module.get<ChangeFullNameSingerController>(ChangeFullNameSingerController);
        commandBus = module.get<CommandBus>(CommandBus);
        jest.clearAllMocks();
    });

    it('should execute command', async () => {
        const dto = new ChangeFullNameSingerDto();
        dto.newFullName = 'Name';
        dto.trackingId = 'track';

        await controller.changeFullName('id-1', dto);

        expect(commandBus.execute).toHaveBeenCalledWith(expect.any(ChangeFullNameSingerCommand));
    });

    it('should return if dto is missing', async () => {
        await controller.changeFullName('id-1', undefined as any);
        expect(commandBus.execute).not.toHaveBeenCalled();
    });
});
