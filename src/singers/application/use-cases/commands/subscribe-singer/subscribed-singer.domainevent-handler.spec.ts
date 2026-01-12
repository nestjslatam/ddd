import { Test, TestingModule } from '@nestjs/testing';
import { SingerSubscribedDomainEventHandler } from './subscribed-singer.domainevent-handler';
import { SingerSubscribedDomainEvent } from '../../../../domain/events';

describe('SingerSubscribedDomainEventHandler', () => {
    let handler: SingerSubscribedDomainEventHandler;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SingerSubscribedDomainEventHandler],
        }).compile();

        handler = module.get<SingerSubscribedDomainEventHandler>(SingerSubscribedDomainEventHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    it('should handle event', () => {
        const event = new SingerSubscribedDomainEvent('id-1', new Date());
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        handler.handle(event);

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('SingerSubscribedDomainEventHandler'));
        consoleSpy.mockRestore();
    });
});
