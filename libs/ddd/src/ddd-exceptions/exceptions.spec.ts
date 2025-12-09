
import { jest } from '@jest/globals';
import { Subject } from 'rxjs';
import {
  DomainArgumentInvalidException,
  DomainArgumentNotProvidedException,
  DomainArgumentOutOfRangeException,
  BrokenRulesException,
  DomainCommandHandlerNotFoundException,
  DomainInvalidCommandHandlerException,
  DomainConflictException,
  DomainNotFoundException,
  DomainInternalServerErrorException,
  DomainEventException,
  DomainEventBusException,
  DefaultUnhandledExceptionPublisher,
  UnhandledExceptionDomainBus,
  DomainInvalidSagaException,
} from './impl';
import { UnhandledExceptionInfo } from './interfaces';

describe('Exceptions', () => {
  it('should create DomainArgumentInvalidException', () => {
    const exception = new DomainArgumentInvalidException('test');
    expect(exception.message).toBe('test');
    expect(exception.name).toBe('DomainArgumentInvalidException');
  });

  it('should create DomainArgumentNotProvidedException', () => {
    const exception = new DomainArgumentNotProvidedException('test');
    expect(exception.message).toBe('test');
    expect(exception.name).toBe('DomainArgumentNotProvidedException');
  });

  it('should create DomainArgumentOutOfRangeException', () => {
    const exception = new DomainArgumentOutOfRangeException('test');
    expect(exception.message).toBe('test');
    expect(exception.name).toBe('DomainArgumentOutOfRangeException');
  });

  it('should create BrokenRulesException', () => {
    const exception = new BrokenRulesException('test');
    expect(exception.message).toBe('test');
    expect(exception.name).toBe('BrokenRulesException');
  });

  it('should create DomainCommandHandlerNotFoundException', () => {
    const exception = new DomainCommandHandlerNotFoundException('test');
    expect(exception.message).toBe('test');
    expect(exception.name).toBe('DomainCommandHandlerNotFoundException');
  });

  it('should create DomainInvalidCommandHandlerException', () => {
    const exception = new DomainInvalidCommandHandlerException('test');
    expect(exception.message).toBe('test');
    expect(exception.name).toBe('DomainInvalidCommandHandlerException');
  });

  it('should create DomainConflictException', () => {
    const exception = new DomainConflictException('test');
    expect(exception.message).toBe('test');
    expect(exception.name).toBe('DomainConflictException');
  });

  it('should create DomainNotFoundException', () => {
    const exception = new DomainNotFoundException('test');
    expect(exception.message).toBe('test');
    expect(exception.name).toBe('DomainNotFoundException');
  });

  it('should create DomainInternalServerErrorException', () => {
    const exception = new DomainInternalServerErrorException('test');
    expect(exception.message).toBe('test');
    expect(exception.name).toBe('DomainInternalServerErrorException');
  });

  it('should create DomainEventException', () => {
    const exception = new DomainEventException('test');
    expect(exception.message).toBe('test');
    expect(exception.name).toBe('DomainEventException');
  });

  it('should create DomainEventBusException', () => {
    const exception = new DomainEventBusException('test');
    expect(exception.message).toBe('test');
    expect(exception.name).toBe('DomainEventBusException');
  });

  it('should create DomainInvalidSagaException', () => {
    const exception = new DomainInvalidSagaException('test');
    expect(exception.message).toBe('test');
    expect(exception.name).toBe('DomainInvalidSagaException');
  });
});

describe('DefaultUnhandledExceptionPublisher', () => {
  it('should publish an exception', (done) => {
    const subject = new Subject<UnhandledExceptionInfo>();
    const publisher = new DefaultUnhandledExceptionPublisher(subject);
    const exceptionInfo: UnhandledExceptionInfo = { cause: {}, exception: new Error('test') };

    subject.subscribe((info) => {
      expect(info).toBe(exceptionInfo);
      done();
    });

    publisher.publish(exceptionInfo);
  });
});

describe('UnhandledExceptionDomainBus', () => {
  it('should publish an exception', (done) => {
    const bus = new UnhandledExceptionDomainBus();
    const exceptionInfo: UnhandledExceptionInfo = { cause: {}, exception: new Error('test') };

    bus.subscribe((info) => {
      expect(info).toBe(exceptionInfo);
      done();
    });

    bus.publish(exceptionInfo);
  });

  it('should filter exceptions by type', (done) => {
    const bus = new UnhandledExceptionDomainBus();
    class MyError extends Error {}
    const exceptionInfo: UnhandledExceptionInfo = { cause: {}, exception: new MyError('test') };

    const stream = UnhandledExceptionDomainBus.ofType(MyError)(bus);

    stream.subscribe((info) => {
      expect(info).toBe(exceptionInfo);
      done();
    });

    bus.publish(exceptionInfo);
    bus.publish({ cause: {}, exception: new Error('another') });
  });
});
