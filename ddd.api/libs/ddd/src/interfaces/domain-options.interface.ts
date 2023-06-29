import { Type } from '@nestjs/common';

import { IDomainEventHandler } from './domain-events';
import { IDomainCommandHandler } from './domain-commands';

export interface IDomainOptions {
  domainEventHandlers?: Type<IDomainEventHandler>[];
  domainCommandHandlers?: Type<IDomainCommandHandler>[];
  domainSagas?: Type<any>[];
}
