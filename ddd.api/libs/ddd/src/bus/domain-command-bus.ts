import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import 'reflect-metadata';

import {
  DomainCommandHandlerNotFoundException,
  DomainInvalidCommandHandlerException,
} from '../exceptions';
import {
  ICommand,
  ICommandBus,
  ICommandHandler,
  ICommandMetadata,
  ICommandPublisher,
} from './core/interfaces';
import { ObservableBus } from './core';
import {
  DOMAIN_COMMAND_HANDLER_METADATA,
  DOMAIN_COMMAND_METADATA,
} from './decorators';
import { DefaultCommandPubSubHelper } from './helpers';

export type CommandHandlerType = Type<ICommandHandler<ICommand>>;

@Injectable()
export class DomainCommandBus<CommandBase extends ICommand = ICommand>
  extends ObservableBus<CommandBase>
  implements ICommandBus<CommandBase>
{
  private handlers = new Map<string, ICommandHandler<CommandBase>>();
  private _publisher: ICommandPublisher<CommandBase>;

  constructor(private readonly moduleRef: ModuleRef) {
    super();
    this.useDefaultPublisher();
  }

  get publisher(): ICommandPublisher<CommandBase> {
    return this._publisher;
  }

  set publisher(_publisher: ICommandPublisher<CommandBase>) {
    this._publisher = _publisher;
  }

  execute<T extends CommandBase, R = any>(command: T): Promise<R> {
    const commandId = this.getCommandId(command);
    const handler = this.handlers.get(commandId);
    if (!handler) {
      throw new DomainCommandHandlerNotFoundException(commandId);
    }
    this._publisher.publish(command);
    return handler.execute(command);
  }

  bind<T extends CommandBase>(handler: ICommandHandler<T>, id: string) {
    this.handlers.set(id, handler);
  }

  register(handlers: CommandHandlerType[] = []) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  protected registerHandler(handler: CommandHandlerType) {
    const instance = this.moduleRef.get(handler, { strict: false });
    if (!instance) {
      return;
    }
    const target = this.reflectCommandId(handler);
    if (!target) {
      throw new DomainInvalidCommandHandlerException(
        "CommandHandler doesn't have a Command associated",
      );
    }
    this.bind(instance as ICommandHandler<CommandBase>, target);
  }

  private getCommandId(command: CommandBase): string {
    const { constructor: commandType } = Object.getPrototypeOf(command);
    const commandMetadata: ICommandMetadata = Reflect.getMetadata(
      DOMAIN_COMMAND_METADATA,
      commandType,
    );
    if (!commandMetadata) {
      throw new DomainCommandHandlerNotFoundException(commandType.name);
    }

    return commandMetadata.id;
  }

  private reflectCommandId(handler: CommandHandlerType): string | undefined {
    const command: Type<ICommand> = Reflect.getMetadata(
      DOMAIN_COMMAND_HANDLER_METADATA,
      handler,
    );
    const commandMetadata: ICommandMetadata = Reflect.getMetadata(
      DOMAIN_COMMAND_METADATA,
      command,
    );
    return commandMetadata.id;
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultCommandPubSubHelper<CommandBase>(
      this.subject$,
    );
  }
}
