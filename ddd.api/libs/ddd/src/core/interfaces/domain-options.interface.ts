import { Type } from '@nestjs/common';

import { IDomainEventHandler } from './domain-event-handler.interface';
import { ICommandHandler } from './command-handler.interface';

export interface IDomainOptions {
  domainEvents?: Type<IDomainEventHandler>[];
  commands?: Type<ICommandHandler>[];
  sagas?: Type<any>[];
}
