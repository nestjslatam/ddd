import { Test, TestingModule } from '@nestjs/testing';
import { SubscribeSingerController } from './susbcribe-singer.controller';
import { CommandBus } from '@nestjs/cqrs';
import { SubscribeSingerDto } from './susbcribe-singer.dto';
import { SubscribeSingerCommand } from './susbcribe-singer.command';

describe('SubscribeSingerController', () => {
    let controller: SubscribeSingerController;
    let commandBus: CommandBus;

    const mockCommandBus = {
        execute: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SubscribeSingerController],
            providers: [
                { provide: CommandBus, useValue: mockCommandBus },
            ],
        }).compile();

        controller = module.get<SubscribeSingerController>(SubscribeSingerController);
        commandBus = module.get<CommandBus>(CommandBus);
        jest.clearAllMocks();
    });

    it('should execute command', async () => {
        const dto = new SubscribeSingerDto();
        dto.singerId = 'id-1';
        dto.trackingId = 'track';

        await controller.subscribe(dto);

        expect(commandBus.execute).toHaveBeenCalledWith(expect.any(SubscribeSingerCommand));
    });

    it('should return if dto is missing', async () => {
        await controller.subscribe(undefined as any);
        expect(commandBus.execute).not.toHaveBeenCalled();
    });
});
