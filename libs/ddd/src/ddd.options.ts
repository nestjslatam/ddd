import { Type } from '@nestjs/common';
import { ICommandHandler, IDomainEventHandler } from '.';

export interface IDddOptions {
  domainEvents?: Type<IDomainEventHandler>[];
  commands?: Type<ICommandHandler>[];
  sagas?: Type<any>[];
}
