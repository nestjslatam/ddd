import 'reflect-metadata';
import { v4 } from 'uuid';

import {
  DOMAIN_EVENT_METADATA,
  DOMAIN_EVENTS_HANDLER_METADATA,
} from './constants';
import { IDomainEvent } from '../ddd-events';

/**
 * Decorator used to mark a class as a domain event handler.
 * A domain event handler is responsible for handling a specific domain event.
 * It is used in conjunction with the `DomainEvent` decorator.
 *
 * @param events - The domain events that the handler is responsible for.
 *                 It can be either an instance of `IDomainEvent` or a constructor function that implements `IDomainEvent`.
 *
 * @returns A class decorator function.
 */
export const DomainEventHandler = (
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
