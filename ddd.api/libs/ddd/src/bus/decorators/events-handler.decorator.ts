import 'reflect-metadata';
import { IDomainEvent } from '@nestjslatam/ddd';

import {
  DOMAIN_EVENT_METADATA,
  DOMAIN_EVENTS_HANDLER_METADATA,
} from './constants';
import { v4 } from 'uuid';

export const DomainEventsHandler = (
  ...events: (IDomainEvent | (new (...args: any[]) => IDomainEvent))[]
): ClassDecorator => {
  return (target: object) => {
    events.forEach((event) => {
      if (!Reflect.hasOwnMetadata(DOMAIN_EVENT_METADATA, event)) {
        Reflect.defineMetadata(DOMAIN_EVENT_METADATA, { id: v4() }, event);
      }
    });

    Reflect.defineMetadata(DOMAIN_EVENTS_HANDLER_METADATA, events, target);
  };
};
