import { Test, TestingModule } from '@nestjs/testing';
import { RemoveSingerController } from './remove-singer.controller';
import { CommandBus } from '@nestjs/cqrs';
import { RemoveSingerCommand } from './remove-singer.command';

describe('RemoveSingerController', () => {
    let controller: RemoveSingerController;
    let commandBus: CommandBus;

    const mockCommandBus = {
        execute: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RemoveSingerController],
            providers: [
                { provide: CommandBus, useValue: mockCommandBus },
            ],
        }).compile();

        controller = module.get<RemoveSingerController>(RemoveSingerController);
        commandBus = module.get<CommandBus>(CommandBus);
        jest.clearAllMocks();
    });

    it('should execute command', async () => {
        await controller.remove('id-1');
        expect(commandBus.execute).toHaveBeenCalledWith(expect.any(RemoveSingerCommand));
    });
});
