/**
 * Represents the DDD module in the application.
 * This module provides services, event buses, and exception handlers for DDD (Domain-Driven Design) implementation.
 * It also implements the `OnApplicationBootstrap` interface to perform initialization tasks when the application starts.
 *
 * @template DomainEventBase - The base type for domain events.
 */
import { Module, OnApplicationBootstrap } from '@nestjs/common';

import { DddService } from './ddd.service';
import { DomainCommandBus } from './ddd-commands';
import {
  DomainEventPublisher,
  DomainEventBus,
  IDomainEvent,
  DomainEventSerializer,
  DomainEventDeserializer,
} from './ddd-events';
import { UnhandledExceptionDomainBus } from './ddd-exceptions';

/**
 * Represents the DDD module in the application.
 */
@Module({
  imports: [],
  providers: [
    DddService,
    DomainCommandBus,
    DomainEventBus,
    DomainEventPublisher,
    UnhandledExceptionDomainBus,
    DomainEventSerializer,
    DomainEventDeserializer,
  ],
  exports: [
    DddService,
    DomainCommandBus,
    DomainEventBus,
    DomainEventPublisher,
    UnhandledExceptionDomainBus,
    DomainEventSerializer,
    DomainEventDeserializer,
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

  /**
   * Performs initialization tasks when the application starts.
   */
  onApplicationBootstrap() {
    const { domainEvents, sagas, domainCommands } =
      this.explorerService.explore();

    this.eventBus.register(domainEvents);
    this.domainCommandBus.register(domainCommands);
    this.eventBus.registerSagas(sagas);
  }
}
