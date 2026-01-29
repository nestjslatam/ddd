/**
 * Represents the DDD module in the application.
 * This module provides services, event buses, and exception handlers for DDD (Domain-Driven Design) implementation.
 * It also implements the `OnApplicationBootstrap` interface to perform initialization tasks when the application starts.
 *
 * @template DomainEventBase - The base type for domain events.
 */
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { DddService } from './ddd.service';
@Module({
  imports: [],
  providers: [
    {
      provide: DddService,
      useFactory: (modulesContainer: ModulesContainer) => {
        return new DddService(modulesContainer);
      },
      inject: [ModulesContainer],
    },
  ],
  exports: [DddService],
})
export class DddModule implements OnApplicationBootstrap {
  constructor() {}

  /**
   * Performs initialization tasks when the application starts.
   */
  onApplicationBootstrap() {}
}
