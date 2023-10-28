import { Injectable, Type } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { IDomainEvent } from '@nestjslatam/ddd';

import {
  DOMAIN_COMMAND_HANDLER_METADATA,
  DOMAIN_EVENTS_HANDLER_METADATA,
  DOMAIN_SAGA_METADATA,
  ICommandHandler,
  IDddBusOptions,
  IDomainEventHandler,
} from './bus';

@Injectable()
export class DddService<EventBase extends IDomainEvent = IDomainEvent> {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  explore(): IDddBusOptions {
    const modules = [...this.modulesContainer.values()];

    const commands = this.flatMap<ICommandHandler>(modules, (instance) =>
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

    return { commands, domainEvents, sagas };
  }

  flatMap<T>(
    modules: Module[],
    callback: (instance: InstanceWrapper) => Type<any> | undefined,
  ): Type<T>[] {
    const items = modules
      .map((module) => [...module.providers.values()].map(callback))
      .reduce((a, b) => a.concat(b), []);
    return items.filter((element) => !!element) as Type<T>[];
  }

  filterProvider(
    wrapper: InstanceWrapper,
    metadataKey: string,
  ): Type<any> | undefined {
    const { instance } = wrapper;
    if (!instance) {
      return undefined;
    }
    return this.extractMetadata(instance, metadataKey);
  }

  extractMetadata(
    instance: Record<string, any>,
    metadataKey: string,
  ): Type<any> {
    if (!instance.constructor) {
      return;
    }
    const metadata = Reflect.getMetadata(metadataKey, instance.constructor);
    return metadata ? (instance.constructor as Type<any>) : undefined;
  }
}
