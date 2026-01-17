import { Type } from '@nestjs/common';
import { DomainEventHandlerType, IDomainEvent } from '../ddd-events';
import {
  DOMAIN_EVENTS_HANDLER_METADATA,
  DOMAIN_EVENT_METADATA,
} from './constants';

export class ReflectEventHelper {
  static readonly getDomainEventId = <
    TDomainEventBase extends IDomainEvent = IDomainEvent,
  >(
    event: TDomainEventBase,
  ): string => {
    const { constructor } = Object.getPrototypeOf(event);
    return Reflect.getMetadata(DOMAIN_EVENT_METADATA, constructor)?.id ?? null;
  };

  static readonly getReflectDomainEventId = <
    TDomainEventBase extends Type<IDomainEvent> = Type<IDomainEvent>,
  >(
    event: TDomainEventBase,
  ): string => {
    return Reflect.getMetadata(DOMAIN_EVENT_METADATA, event).id;
  };

  static reflectEvents(
    handler: DomainEventHandlerType<IDomainEvent>,
  ): FunctionConstructor[] {
    return Reflect.getMetadata(DOMAIN_EVENTS_HANDLER_METADATA, handler);
  }
}
