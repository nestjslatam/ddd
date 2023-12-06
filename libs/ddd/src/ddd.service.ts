import { Injectable, Type } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { DomainObjectHelper } from './ddd-helpers';
import { IDomainCommandHandler } from './ddd-commands';
import { IDomainEvent, IDomainEventHandler } from './ddd-events';
import { IDddOptions } from './ddd.options';
import {
  DOMAIN_COMMAND_HANDLER_METADATA,
  DOMAIN_EVENTS_HANDLER_METADATA,
  DOMAIN_SAGA_METADATA,
} from './ddd-decorators';

@Injectable()
export class DddService<EventBase extends IDomainEvent = IDomainEvent> {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  explore(): IDddOptions {
    const modules = [...this.modulesContainer.values()];

    const domainCommands = this.flatMap<IDomainCommandHandler>(
      modules,
      (instance) =>
        this.filterProvider(instance, DOMAIN_COMMAND_HANDLER_METADATA),
    );

    const domainEvents = this.flatMap<IDomainEventHandler<EventBase>>(
      modules,
      (instance) =>
        this.filterProvider(instance, DOMAIN_EVENTS_HANDLER_METADATA),
    );

    const sagas = this.flatMap(modules, (instance) =>
      this.filterProvider(instance, DOMAIN_SAGA_METADATA),
    );

    return { domainCommands, domainEvents, sagas };
  }

  flatMap<T>(
    modules: Module[],
    callback: (instance: InstanceWrapper) => Type<any> | undefined,
  ): Type<T>[] {
    return DomainObjectHelper.flatMap<T>(modules, callback);
  }

  filterProvider(
    wrapper: InstanceWrapper,
    metadataKey: string,
  ): Type<any> | undefined {
    return DomainObjectHelper.filterProvider(wrapper, metadataKey);
  }

  extractMetadata(
    instance: Record<string, any>,
    metadataKey: string,
  ): Type<any> {
    return DomainObjectHelper.extractMetadata(instance, metadataKey);
  }
}
