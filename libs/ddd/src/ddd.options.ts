import { Type } from '@nestjs/common';
import { IDomainCommandHandler, IDomainEventHandler } from '.';

export interface IDddOptions {
  domainEvents?: Type<IDomainEventHandler>[];
  domainCommands?: Type<IDomainCommandHandler>[];
  sagas?: Type<any>[];
}
