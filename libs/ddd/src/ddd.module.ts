import { Module, OnApplicationBootstrap } from '@nestjs/common';

import { DddService } from './ddd.service';
import { DomainCommandBus } from './ddd-commands';
import {
  DomainEventPublisher,
  DomainEventBus,
  IDomainEvent,
} from './ddd-events';
import { UnhandledExceptionBus } from './ddd-exceptions';

@Module({
  imports: [],
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
    private readonly domainCommandBus: DomainCommandBus,
  ) {}

  onApplicationBootstrap() {
    const { domainEvents, sagas, domainCommands } =
      this.explorerService.explore();

    this.eventBus.register(domainEvents);
    this.domainCommandBus.register(domainCommands);
    this.eventBus.registerSagas(sagas);
  }
}
