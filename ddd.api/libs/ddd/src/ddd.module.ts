import { Module, OnApplicationBootstrap } from '@nestjs/common';

import { DomainGuard } from './helpers';
import { IDomainEvent } from './core';
import { ExplorerService } from './services';
import { DomainEventBus } from './domain-event-bus';
import { CommandBus } from './command-bus';

@Module({
  exports: [DomainGuard],
})
export class DddModule<DomainEventBase extends IDomainEvent = IDomainEvent>
  implements OnApplicationBootstrap
{
  constructor(
    private readonly explorerService: ExplorerService<DomainEventBase>,
    private readonly eventBus: DomainEventBus<DomainEventBase>,
    private readonly commandBus: CommandBus,
  ) {}

  onApplicationBootstrap() {
    const { domainEvents, sagas, commands } = this.explorerService.explore();

    this.eventBus.register(domainEvents);
    this.commandBus.register(commands);
    this.eventBus.registerSagas(sagas);
  }
}
