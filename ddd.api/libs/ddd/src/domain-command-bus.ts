import 'reflect-metadata';
import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import {
  DDD_COMMAND_HANDLER_METADATA,
  DDD_COMMAND_METADATA,
} from './decorators';
import {
  IDomainCommand,
  IDomainCommandBus,
  IDomainCommandHandler,
  IDomainCommandMetadata,
  IDomainCommandPublisher,
} from './interfaces';
import { DomainDefaultCommandPublisher, DomainObservableBus } from './utils';
import {
  DomainCommandHandlerNotFoundException,
  DomainInvalidCommandHandlerException,
} from './exceptions';

export type DomainCommandHandlerType = Type<
  IDomainCommandHandler<IDomainCommand>
>;

@Injectable()
export class DomainCommandBus<
    TDomainCommand extends IDomainCommand = IDomainCommand,
  >
  extends DomainObservableBus<TDomainCommand>
  implements IDomainCommandBus<TDomainCommand>
{
  private _domainCommandHandlers = new Map<
    string,
    IDomainCommandHandler<TDomainCommand>
  >();
  private _domainPublisher: IDomainCommandPublisher<TDomainCommand>;

  constructor(private readonly moduleRef: ModuleRef) {
    super();
    this.useDefaultPublisher();
  }

  get getDomainPublisher(): IDomainCommandPublisher<TDomainCommand> {
    return this._domainPublisher;
  }

  set setDomainPublisher(_publisher: IDomainCommandPublisher<TDomainCommand>) {
    this._domainPublisher = _publisher;
  }

  execute<T extends TDomainCommand>(domainCommand: T): Promise<void> {
    const domainCommandId = this.getDomainCommandId(domainCommand);
    const domainCommandHandler =
      this._domainCommandHandlers.get(domainCommandId);
    if (!domainCommandHandler) {
      throw new DomainCommandHandlerNotFoundException(domainCommandId);
    }
    this._domainPublisher.publish(domainCommand);

    return domainCommandHandler.execute(domainCommand);
  }

  bind<T extends TDomainCommand>(
    domainCommandHandler: IDomainCommandHandler<T>,
    id: string,
  ) {
    this._domainCommandHandlers.set(id, domainCommandHandler);
  }

  register(domainCommandHandlerTypes: DomainCommandHandlerType[] = []) {
    domainCommandHandlerTypes.forEach((handler) =>
      this.registerHandler(handler),
    );
  }

  protected registerHandler(
    domainCommandHandlerType: DomainCommandHandlerType,
  ) {
    const instance = this.moduleRef.get(domainCommandHandlerType, {
      strict: false,
    });
    if (!instance) {
      return;
    }
    const target = this.reflectDomainCommandId(domainCommandHandlerType);
    if (!target) {
      throw new DomainInvalidCommandHandlerException();
    }
    this.bind(instance as IDomainCommandHandler<TDomainCommand>, target);
  }

  private getDomainCommandId(command: TDomainCommand): string {
    const { constructor: commandType } = Object.getPrototypeOf(command);
    const commandMetadata: IDomainCommandMetadata = Reflect.getMetadata(
      DDD_COMMAND_METADATA,
      commandType,
    );
    if (!commandMetadata) {
      throw new DomainCommandHandlerNotFoundException(commandType.name);
    }

    return commandMetadata.id;
  }

  private reflectDomainCommandId(
    handler: DomainCommandHandlerType,
  ): string | undefined {
    const command: Type<IDomainCommand> = Reflect.getMetadata(
      DDD_COMMAND_HANDLER_METADATA,
      handler,
    );
    const commandMetadata: IDomainCommandMetadata = Reflect.getMetadata(
      DDD_COMMAND_METADATA,
      command,
    );
    return commandMetadata.id;
  }

  private useDefaultPublisher() {
    this._domainPublisher = new DomainDefaultCommandPublisher<TDomainCommand>(
      this.subject$,
    );
  }
}
