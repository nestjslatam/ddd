import { Test, TestingModule } from '@nestjs/testing';
import { AbstractCommandHandler } from './command-handler.base';
import { DomainEventBus } from '@nestjslatam/ddd-lib';
import { DomainAggregateRoot, DomainEntity } from '@nestjslatam/ddd-lib';
import { DomainException } from '../../exceptions';

// Concrete implementation for testing abstract class
class TestCommandHandler extends AbstractCommandHandler<any> {
    async execute(command: any): Promise<void> {
        return;
    }
}

describe('AbstractCommandHandler', () => {
    let handler: TestCommandHandler;
    let eventBus: DomainEventBus;

    beforeEach(async () => {
        // Mock eventBus
        const eventBusMock = {
            publishAll: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: DomainEventBus,
                    useValue: eventBusMock,
                },
                {
                    provide: TestCommandHandler,
                    useFactory: (eb: DomainEventBus) => new TestCommandHandler(eb),
                    inject: [DomainEventBus]
                }
            ],
        }).compile();

        handler = module.get<TestCommandHandler>(TestCommandHandler);
        eventBus = module.get<DomainEventBus>(DomainEventBus);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('checkBusinessRules', () => {
        it('should throw DomainException if domain is invalid', () => {
            const domainMock = {
                IsValid: false,
                BrokenRules: {
                    asString: () => 'Broken Rule 1',
                },
            } as any as DomainEntity<any>;

            expect(() => handler.checkBusinessRules(domainMock)).toThrow(DomainException);
        });

        it('should pass if domain is valid', () => {
            const domainMock = {
                IsValid: true,
            } as any as DomainEntity<any>;

            expect(() => handler.checkBusinessRules(domainMock)).not.toThrow();
        });
    });

    describe('publish', () => {
        it('should publish events from domain', () => {
            const events = [{ type: 'TestEvent' }];
            const domainMock = {
                commit: jest.fn().mockReturnValue(events),
            } as any as DomainAggregateRoot<any>;

            handler.publish(domainMock);

            expect(eventBus.publishAll).toHaveBeenCalledWith(events);
        });
    });
});
