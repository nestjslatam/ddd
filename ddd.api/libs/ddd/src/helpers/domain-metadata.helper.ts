import { Type } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';

import { DomainEvent } from '../domaint-event';
import { IDomainEventHandler } from '../interfaces';

const ERROR_MESSAGE_DOMAINEVENT = 'DomainEvent is required';

export function flatMap<T>(
  modules: Module[],
  callback: (instance: InstanceWrapper) => Type<any> | undefined,
): Type<T>[] {
  if (!modules) throw new Error('Modules is required');

  const items = modules
    .map((module) => [...module.providers.values()].map(callback))
    .reduce((a, b) => a.concat(b), []);
  return items.filter((element) => !!element) as Type<T>[];
}

export const filterProvider = (
  wrapper: InstanceWrapper,
  metadataKey: string,
): Type<any> | undefined => {
  if (!wrapper) throw new Error('Wrapper is required');

  const { instance } = wrapper;
  if (!instance) {
    return undefined;
  }
  return extractMetadata(instance, metadataKey);
};

export const extractMetadata = (
  instance: Record<string, any>,
  metadataKey: string,
): Type<any> => {
  if (!instance) throw new Error('Instance is required');

  if (!instance.constructor) {
    return;
  }
  const metadata = Reflect.getMetadata(metadataKey, instance.constructor);
  return metadata ? (instance.constructor as Type<any>) : undefined;
};

export function getDomainEventHandler<
  TDomainEvent extends DomainEvent = DomainEvent,
>(domainEvent: TDomainEvent): Type<IDomainEventHandler> | undefined {
  if (!domainEvent) throw new Error(ERROR_MESSAGE_DOMAINEVENT);

  const handler = `on${this.getEventName(domainEvent)}`;
  return this[handler];
}

export const getDomainEventName = (domainEvent: any): string => {
  if (!domainEvent) throw new Error(ERROR_MESSAGE_DOMAINEVENT);

  const { constructor } = Object.getPrototypeOf(domainEvent);
  return constructor.name as string;
};
