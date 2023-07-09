import { Module, OnApplicationBootstrap } from '@nestjs/common';

import { DomainGuard } from './helpers';
import { IDomainEvent } from './core';
import { ExplorerService } from './services';
import { DomainEventBus } from './domain-event-bus';
import { DomainCommandBus } from './domain-command-bus';
import { DomainEventPublisher } from './domain-event-publisher';
import { UnhandledExceptionBus } from './unhandled-exception-bus';

@Module({
  providers: [
    ExplorerService,
    DomainGuard,
    DomainCommandBus,
    DomainEventBus,
    UnhandledExceptionBus,
    DomainEventPublisher,
    DomainGuard,
  ],
  exports: [
    DomainCommandBus,
    DomainEventBus,
    DomainEventPublisher,
    DomainGuard,
    UnhandledExceptionBus,
  ],
})
export class DddModule<DomainEventBase extends IDomainEvent = IDomainEvent>
  implements OnApplicationBootstrap
{
  constructor(
    private readonly explorerService: ExplorerService<DomainEventBase>,
    private readonly eventBus: DomainEventBus<DomainEventBase>,
    private readonly commandBus: DomainCommandBus,
  ) {}

  onApplicationBootstrap() {
    const { domainEvents, sagas, commands } = this.explorerService.explore();

    this.eventBus.register(domainEvents);
    this.commandBus.register(commands);
    this.eventBus.registerSagas(sagas);
  }
}
