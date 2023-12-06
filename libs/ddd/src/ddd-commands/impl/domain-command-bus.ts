import 'reflect-metadata';
import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import {
  IDomainCommand,
  IDomainCommandBus,
  IDomainCommandHandler,
  IDomainCommandMetadata,
  IDomainCommandPublisher,
} from '../interfaces';
import { ObservableBus } from '../../ddd-core';
import {
  DomainCommandHandlerNotFoundException,
  DomainInvalidCommandHandlerException,
} from '../../ddd-exceptions';
import {
  DOMAIN_COMMAND_HANDLER_METADATA,
  DOMAIN_COMMAND_METADATA,
} from '../../ddd-decorators';
import { DefaultCommandPubSubHelper } from './default-command-publisher';

export type CommandHandlerType = Type<IDomainCommandHandler<IDomainCommand>>;

@Injectable()
export class DomainCommandBus<
    DomainCommandBase extends IDomainCommand = IDomainCommand,
  >
  extends ObservableBus<DomainCommandBase>
  implements IDomainCommandBus<DomainCommandBase>
{
  private handlers = new Map<
    string,
    IDomainCommandHandler<DomainCommandBase>
  >();
  private _publisher: IDomainCommandPublisher<DomainCommandBase>;

  constructor(private readonly moduleRef: ModuleRef) {
    super();
    this.useDefaultPublisher();
  }

  get publisher(): IDomainCommandPublisher<DomainCommandBase> {
    return this._publisher;
  }

  set publisher(_publisher: IDomainCommandPublisher<DomainCommandBase>) {
    this._publisher = _publisher;
  }

  execute<T extends DomainCommandBase, R = any>(command: T): Promise<R> {
    const commandId = this.getCommandId(command);
    const handler = this.handlers.get(commandId);
    if (!handler) {
      throw new DomainCommandHandlerNotFoundException(commandId);
    }
    this._publisher.publish(command);
    return handler.execute(command);
  }

  bind<T extends DomainCommandBase>(
    handler: IDomainCommandHandler<T>,
    id: string,
  ) {
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
    this.bind(instance as IDomainCommandHandler<DomainCommandBase>, target);
  }

  private getCommandId(command: DomainCommandBase): string {
    const { constructor: commandType } = Object.getPrototypeOf(command);
    const commandMetadata: IDomainCommandMetadata = Reflect.getMetadata(
      DOMAIN_COMMAND_METADATA,
      commandType,
    );
    if (!commandMetadata) {
      throw new DomainCommandHandlerNotFoundException(commandType.name);
    }

    return commandMetadata.id;
  }

  private reflectCommandId(handler: CommandHandlerType): string | undefined {
    const command: Type<IDomainCommand> = Reflect.getMetadata(
      DOMAIN_COMMAND_HANDLER_METADATA,
      handler,
    );
    const commandMetadata: IDomainCommandMetadata = Reflect.getMetadata(
      DOMAIN_COMMAND_METADATA,
      command,
    );
    return commandMetadata.id;
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultCommandPubSubHelper<DomainCommandBase>(
      this.subject$,
    );
  }
}
