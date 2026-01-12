import { Injectable, Type } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { DomainObjectHelper } from './ddd-helpers';
import { IDomainCommandHandler } from './ddd-commands';
import { IDomainEvent, IDomainEventHandler } from './ddd-events';
import { IDddOptions } from './ddd-core/interfaces/ddd.options';
import {
  DOMAIN_COMMAND_HANDLER_METADATA,
  DOMAIN_EVENTS_HANDLER_METADATA,
  DOMAIN_SAGA_METADATA,
} from './ddd-decorators';

@Injectable()
export class DddService<EventBase extends IDomainEvent = IDomainEvent> {
  /**
   * Creates an instance of DddService.
   * @param modulesContainer - The container holding all the modules in the application.
   */
  constructor(private readonly modulesContainer: ModulesContainer) { }

  /**
   * Explores the modules and extracts the domain commands, domain events, and sagas.
   * @returns An object containing the extracted domain commands, domain events, and sagas.
   */
  explore(): IDddOptions {

    var moduleList = this.modulesContainer.values();

    if (moduleList.return.length === 0) {
      throw new Error('No modules found in the application.');
    }

    const modules = [...moduleList];

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

  /**
   * Flattens the array of modules and applies the callback function to each module instance.
   * @param modules - The array of modules to flatten.
   * @param callback - The callback function to apply to each module instance.
   * @returns An array of instances returned by the callback function.
   */
  flatMap<T>(
    modules: Module[],
    callback: (instance: InstanceWrapper) => Type<any> | undefined,
  ): Type<T>[] {
    return DomainObjectHelper.flatMap<T>({ modules, callback });
  }

  /**
   * Filters the provider based on the metadata key.
   * @param wrapper - The instance wrapper to filter.
   * @param metadataKey - The metadata key to filter the provider.
   * @returns The filtered provider or undefined if not found.
   */
  filterProvider(
    wrapper: InstanceWrapper,
    metadataKey: string,
  ): Type<any> | undefined {
    return DomainObjectHelper.filterProvider(wrapper, metadataKey);
  }

  /**
   * Extracts the metadata from the instance based on the metadata key.
   * @param instance - The instance to extract the metadata from.
   * @param metadataKey - The metadata key to extract the metadata.
   * @returns The extracted metadata.
   */
  extractMetadata(
    instance: Record<string, any>,
    metadataKey: string,
  ): Type<any> {
    return DomainObjectHelper.extractMetadata(instance, metadataKey);
  }
}
