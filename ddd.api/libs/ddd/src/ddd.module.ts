import { Module, OnApplicationBootstrap } from '@nestjs/common';
import {
  DomainCommandBus,
  DomainEventBus,
  DomainEventPublisher,
  UnhandledExceptionBus,
} from './bus';
import { IDomainEvent } from './core';
import { DddService } from './ddd.service';

@Module({
  providers: [
    DddService,
    DomainCommandBus,
    DomainEventBus,
    DomainEventPublisher,
    UnhandledExceptionBus,
  ],
  exports: [
    DddService,
    DomainCommandBus,
    DomainEventBus,
    DomainEventPublisher,
    UnhandledExceptionBus,
  ],
})
export class DddModule<DomainEventBase extends IDomainEvent>
  implements OnApplicationBootstrap
{
  constructor(
    private readonly explorerService: DddService<DomainEventBase>,
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
