import { Injectable } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';

import {
  DDD_COMMAND_HANDLER_METADATA,
  DDD_DOMAIN_EVENTS_HANDLER_METADATA,
  DDD_SAGA_METADATA,
} from '../decorators/domain-constants';

import { DomainEvent } from '../domaint-event';

import { filterProvider, flatMap } from '../helpers';
import {
  IDomainCommandHandler,
  IDomainEventHandler,
  IDomainOptions,
} from '../interfaces';

@Injectable()
export class DomainExplorerService<
  EventBase extends DomainEvent = DomainEvent,
> {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  explore(): IDomainOptions {
    const modules = [...this.modulesContainer.values()];

    const domainCommandHandlers = flatMap<IDomainCommandHandler>(
      modules,
      (instance) => filterProvider(instance, DDD_COMMAND_HANDLER_METADATA),
    );

    const domainEventHandlers = flatMap<IDomainEventHandler<EventBase>>(
      modules,
      (instance) =>
        filterProvider(instance, DDD_DOMAIN_EVENTS_HANDLER_METADATA),
    );

    const domainSagas = flatMap(modules, (instance) =>
      filterProvider(instance, DDD_SAGA_METADATA),
    );

    return { domainCommandHandlers, domainEventHandlers, domainSagas };
  }
}
