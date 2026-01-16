import { Type } from '@nestjs/common';
import { IDomainCommandHandler, IDomainEventHandler } from '../..';

export interface IOptions {
  events?: Type<IDomainEventHandler>[];
  commands?: Type<IDomainCommandHandler>[];
  sagas?: Type<any>[];
}
