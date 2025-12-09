
import { jest } from '@jest/globals';
import { ModuleRef } from '@nestjs/core';
import { ReflectCommandHelper } from '../../ddd-decorators/reflect-command.helper';
import { DomainCommandHandler } from '../../ddd-decorators';
import { DomainCommandHandlerNotFoundException, DomainInvalidCommandHandlerException } from '../../ddd-exceptions';
import { IDomainCommand, IDomainCommandHandler } from '../interfaces';
import { DomainCommandBus } from './domain-command-bus';

class TestCommand implements IDomainCommand {
  readonly metadata = { id: 'TestCommand' };
}

@DomainCommandHandler(TestCommand)
class TestCommandHandler implements IDomainCommandHandler<TestCommand> {
  execute = jest.fn<() => Promise<string>>().mockResolvedValue('test');
}

describe('DomainCommandBus', () => {
  let commandBus: DomainCommandBus<TestCommand>;
  let moduleRef: ModuleRef;

  beforeEach(() => {
    moduleRef = { get: jest.fn() } as any;
    commandBus = new DomainCommandBus<TestCommand>(moduleRef);
  });

  it('should be defined', () => {
    expect(commandBus).toBeDefined();
  });

  it('should register a command handler', () => {
    const handler = new TestCommandHandler();
    jest.spyOn(moduleRef, 'get').mockReturnValue(handler);
    commandBus.register([TestCommandHandler]);
    const command = new TestCommand();
    commandBus.execute(command);
    expect(handler.execute).toHaveBeenCalled();
  });

  it('should throw an error if no handler is registered for a command', () => {
    const command = new TestCommand();
    const commandId = ReflectCommandHelper.getCommandId(command);
    expect(() => commandBus.execute(command)).toThrow(
      new DomainCommandHandlerNotFoundException(`Command Id: ${commandId}, does not have a command handler assigned`),
    );
  });

  it('should throw an error when binding a handler to an already bound command', () => {
    const handler = new TestCommandHandler();
    const command = new TestCommand();
    const commandId = ReflectCommandHelper.getCommandId(command);
    commandBus.bind(handler, commandId);
    expect(() => commandBus.bind(handler, commandId)).toThrow(
      new DomainInvalidCommandHandlerException(`Command Id: ${commandId}, already has a command handler assigned`),
    );
  });

  it('should publish a command when executed', () => {
    const handler = new TestCommandHandler();
    const command = new TestCommand();
    const commandId = ReflectCommandHelper.getCommandId(command);
    commandBus.bind(handler, commandId);
    const publisher = { publish: jest.fn() };
    commandBus.publisher = publisher;
    commandBus.execute(command);
    expect(publisher.publish).toHaveBeenCalledWith(command);
  });
});
