import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import {
  IDomainCommand,
  IDomainCommandBus,
  IDomainCommandHandler,
  IDomainCommandPublisher,
} from '../interfaces';
import { ObservableBus } from '../../ddd-core';
import {
  DomainCommandHandlerNotFoundException,
  DomainInvalidCommandHandlerException,
} from '../../ddd-exceptions';

import { DefaultCommandPublisher } from './default-command-publisher';
import { ReflectCommandHelper } from '../../ddd-decorators';
import { CommandHandlerType } from './command-types';

/**
 * Represents a domain command bus that handles the execution and routing of domain commands.
 * It implements the IDomainCommandBus interface.
 *
 * @template TDomainCommandBase - The base type for domain commands.
 */
@Injectable()
export class DomainCommandBus<
    TDomainCommandBase extends IDomainCommand = IDomainCommand,
  >
  extends ObservableBus<TDomainCommandBase>
  implements IDomainCommandBus<TDomainCommandBase>
{
  /**
   * A map that stores the command handlers associated with their command IDs.
   */
  private _handlers = new Map<
    string,
    IDomainCommandHandler<TDomainCommandBase>
  >();

  /**
   * The publisher responsible for publishing the domain commands.
   */
  private _publisher: IDomainCommandPublisher<TDomainCommandBase>;

  /**
   * Creates an instance of DomainCommandBus.
   *
   * @param moduleRef - The module reference used for dependency injection.
   */
  constructor(private readonly moduleRef: ModuleRef) {
    super();

    this.useDefaultPublisher();
  }

  /**
   * Gets the publisher responsible for publishing the domain commands.
   */
  get publisher(): IDomainCommandPublisher<TDomainCommandBase> {
    return this._publisher;
  }

  /**
   * Sets the publisher responsible for publishing the domain commands.
   */
  set publisher(publisher: IDomainCommandPublisher<TDomainCommandBase>) {
    this._publisher = publisher;
  }

  /**
   * Executes a domain command by finding the associated command handler and executing it.
   *
   * @param command - The domain command to execute.
   * @returns A promise that resolves to the result of the command execution.
   * @throws {DomainCommandHandlerNotFoundException} If no command handler is found for the command.
   */
  execute<T extends TDomainCommandBase, R = any>(command: T): Promise<R> {
    const commandId = ReflectCommandHelper.getCommandId(command);

    const handler = this._handlers.get(commandId);

    if (!handler) {
      throw new DomainCommandHandlerNotFoundException(
        `Command Id: ${commandId}, does not have a command handler assigned`,
      );
    }

    this._publisher.publish(command);

    return handler.execute(command);
  }

  /**
   * Binds a command handler to a command ID.
   *
   * @param handler - The command handler to bind.
   * @param id - The ID of the command.
   * @throws {DomainInvalidCommandHandlerException} If a command handler is already bound to the command ID.
   */
  bind<T extends TDomainCommandBase>(
    handler: IDomainCommandHandler<T>,
    id: string,
  ) {
    if (this._handlers.has(id)) {
      throw new DomainInvalidCommandHandlerException(
        `Command Id: ${id}, already has a command handler assigned`,
      );
    }

    this._handlers.set(id, handler);
  }

  /**
   * Registers an array of command handlers.
   *
   * @param handlers - The array of command handlers to register.
   */
  register(handlers: CommandHandlerType[] = []) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  /**
   * Registers a single command handler.
   *
   * @param handler - The command handler to register.
   * @throws {DomainInvalidCommandHandlerException} If the command handler is not associated with a command.
   */
  protected registerHandler(handler: CommandHandlerType) {
    const instance = this.moduleRef.get(handler, { strict: false });

    if (!instance) {
      return;
    }

    const target = ReflectCommandHelper.reflectCommandId(handler);

    if (!target) {
      throw new DomainInvalidCommandHandlerException(
        "CommandHandler doesn't have a Command associated",
      );
    }

    this.bind(instance as IDomainCommandHandler<TDomainCommandBase>, target);
  }

  /**
   * Sets the default command publisher for the domain command bus.
   */
  private useDefaultPublisher() {
    this._publisher = new DefaultCommandPublisher<TDomainCommandBase>(
      this.subject$,
    );
  }
}
