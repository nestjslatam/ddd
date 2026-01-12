import { Test, TestingModule } from '@nestjs/testing';
import { CreateSingerController } from './create-singer-controller';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSingerDto } from './create-singer.dto';
import { CreateSingerCommand } from './create-singer.command';

describe('CreateSingerController', () => {
    let controller: CreateSingerController;
    let commandBus: CommandBus;

    const mockCommandBus = {
        execute: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CreateSingerController],
            providers: [
                { provide: CommandBus, useValue: mockCommandBus },
            ],
        }).compile();

        controller = module.get<CreateSingerController>(CreateSingerController);
        commandBus = module.get<CommandBus>(CommandBus);
        jest.clearAllMocks();
    });

    it('should execute command', async () => {
        const dto = new CreateSingerDto();
        dto.fullName = 'John';
        dto.picture = 'p';
        dto.trackingId = 't';

        await controller.create(dto);

        expect(commandBus.execute).toHaveBeenCalledWith(expect.any(CreateSingerCommand));
    });

    it('should return if dto is missing', async () => {
        await controller.create(undefined as any);
        expect(commandBus.execute).not.toHaveBeenCalled();
    });
});
