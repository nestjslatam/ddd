import { Module, OnApplicationBootstrap } from '@nestjs/common';

import { DomainCommandBus } from './domain-command-bus';
import { DomainEventBus } from './domain-event-bus';
import { DomainEventPublisher } from './domain-event-publisher';
import { DomainExplorerService } from './services';
import { DomainGuard } from './helpers';
import { DomainEvent } from './domaint-event';

@Module({
  providers: [
    DomainCommandBus,
    DomainEventBus,
    DomainEventPublisher,
    DomainExplorerService,
    DomainGuard,
  ],
  exports: [
    DomainCommandBus,
    DomainEventBus,
    DomainEventPublisher,
    DomainGuard,
  ],
})
export class DddModule<EventBase extends DomainEvent = DomainEvent>
  implements OnApplicationBootstrap
{
  constructor(
    private readonly explorerService: DomainExplorerService<EventBase>,
    private readonly eventsDomainBus: DomainEventBus<EventBase>,
    private readonly commandsBus: DomainCommandBus,
  ) {}

  onApplicationBootstrap() {
    const { domainEventHandlers, domainSagas, domainCommandHandlers } =
      this.explorerService.explore();

    this.commandsBus.register(domainCommandHandlers);
    this.eventsDomainBus.register(domainEventHandlers);
    this.eventsDomainBus.registerSagas(domainSagas);
  }
}
