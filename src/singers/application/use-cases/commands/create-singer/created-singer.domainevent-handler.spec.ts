import { Test, TestingModule } from '@nestjs/testing';
import { SingerCreatedDomainEventHandler } from './created-singer.domainevent-handler';
import { SingerCreatedDomainEvent } from '../../../../domain/events';

describe('SingerCreatedDomainEventHandler', () => {
    let handler: SingerCreatedDomainEventHandler;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SingerCreatedDomainEventHandler],
        }).compile();

        handler = module.get<SingerCreatedDomainEventHandler>(SingerCreatedDomainEventHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    it('should handle event', () => {
        const event = new SingerCreatedDomainEvent('id-1', 'Name');
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        handler.handle(event);

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('SingerCreatedDomainEventHandler'));
        consoleSpy.mockRestore();
    });
});
