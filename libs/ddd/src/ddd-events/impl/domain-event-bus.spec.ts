import { jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import {
  DomainCommandBus,
  IDomainCommand,
  IDomainCommandMetadata,
} from '../../ddd-commands';
import { ISaga } from '../../ddd-core';
import { DomainEventHandler } from '../../ddd-decorators';
import {
  UnhandledExceptionDomainBus,
  UnhandledExceptionInfo,
} from '../../ddd-exceptions';
import { ReflectEventHelper } from '../../ddd-decorators';
import { DomainEventBus } from './domain-event-bus';
import { IDomainEvent, IDomainEventHandler } from '../interfaces';

// Mock Logger to prevent console output during tests
jest.spyOn(Logger, 'error').mockImplementation(() => {});

class TestEvent implements IDomainEvent {
  constructor(public readonly aggregateId: string) {}
}

class TestCommand implements IDomainCommand {
  readonly metadata: IDomainCommandMetadata = { id: 'test' };
}

@DomainEventHandler(TestEvent)
class TestEventHandler implements IDomainEventHandler<TestEvent> {
  handle = jest.fn();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const testSaga: ISaga<TestEvent> = (_events$) => {
  return new Observable<IDomainCommand>();
};

describe('DomainEventBus', () => {
  let eventBus: DomainEventBus<TestEvent>;
  let commandBus: DomainCommandBus;
  let moduleRef: ModuleRef;
  let unhandledExceptionBus: UnhandledExceptionDomainBus;

  beforeEach(() => {
    commandBus = { execute: jest.fn().mockReturnValue(of(undefined)) } as any;
    unhandledExceptionBus = { publish: jest.fn() } as any;
    moduleRef = { get: jest.fn() } as any;

    eventBus = new DomainEventBus<TestEvent>(
      commandBus,
      moduleRef,
      unhandledExceptionBus,
    );
  });

  it('should be defined', () => {
    expect(eventBus).toBeDefined();
  });

  it('should publish an event to the subject', (done) => {
    const event = new TestEvent('123');
    eventBus.subscribe((e) => {
      expect(e).toBe(event);
      done();
    });
    eventBus.publish(event);
  });

  it('should bind an event handler and handle an event', () => {
    const handler = new TestEventHandler();
    const event = new TestEvent('123');
    eventBus.bind(handler, ReflectEventHelper.getDomainEventId(event)!);
    eventBus.publish(event);
    expect(handler.handle).toHaveBeenCalledWith(event);
  });

  it('should register a saga', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const saga: ISaga<TestEvent> = (_events$) => of(new TestCommand());
    eventBus['registerSaga'](saga);
    const event = new TestEvent('123');
    eventBus.publish(event);
    expect(commandBus.execute).toHaveBeenCalledWith(expect.any(TestCommand));
  });

  it('should register handlers via the register method', () => {
    const handler = new TestEventHandler();
    jest.spyOn(moduleRef, 'get').mockReturnValue(handler);
    eventBus.register([TestEventHandler]);
    const event = new TestEvent('123');
    eventBus.publish(event);
    expect(handler.handle).toHaveBeenCalledWith(event);
  });

  it('should handle exceptions in event handlers and publish to unhandledExceptionBus', async () => {
    const error = new Error('Test Error');
    const handler = {
      handle: jest.fn().mockImplementation(() => Promise.reject(error)),
    };
    const event = new TestEvent('123');

    let caughtError: UnhandledExceptionInfo | undefined;
    jest
      .spyOn(unhandledExceptionBus, 'publish')
      .mockImplementation((info: UnhandledExceptionInfo) => {
        caughtError = info;
      });

    eventBus.bind(handler as any, ReflectEventHelper.getDomainEventId(event)!);
    eventBus.publish(event);

    // Wait for the async operations to complete
    await new Promise(process.nextTick);

    expect(caughtError).toBeDefined();
    expect(caughtError?.exception).toBe(error);
    expect(caughtError?.cause).toBe(event);
  });

  it('should unsubscribe all subscriptions on module destroy', () => {
    const subscription = { unsubscribe: jest.fn() };
    eventBus['_subscriptions'].push(subscription as any);
    eventBus.onModuleDestroy();
    expect(subscription.unsubscribe).toHaveBeenCalled();
  });
});
