import { Type } from '@nestjs/common';
import { ICommandHandler, IDomainEventHandler } from './core';

export interface IDddBusOptions {
  domainEvents?: Type<IDomainEventHandler>[];
  commands?: Type<ICommandHandler>[];
  sagas?: Type<any>[];
}
