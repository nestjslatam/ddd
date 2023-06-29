import 'reflect-metadata';
import { v4 } from 'uuid';

import {
  DDD_DOMAIN_EVENT_METADATA,
  DDD_DOMAIN_EVENTS_HANDLER_METADATA,
} from './domain-constants';
import { IDomainEvent } from '../interfaces';

export const DddEventHandler = (
  ...domainEvents: IDomainEvent[]
): ClassDecorator => {
  if (domainEvents === undefined || null) return;

  return (target: object) => {
    domainEvents.forEach((domainEvent) => {
      if (!Reflect.hasOwnMetadata(DDD_DOMAIN_EVENT_METADATA, domainEvent)) {
        Reflect.defineMetadata(
          DDD_DOMAIN_EVENT_METADATA,
          { id: v4() },
          domainEvent,
        );
      }
    });

    Reflect.defineMetadata(
      DDD_DOMAIN_EVENTS_HANDLER_METADATA,
      domainEvents,
      target,
    );
  };
};
