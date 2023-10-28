import { IDomainEvent } from '@nestjslatam/ddd';
import { Type } from '@nestjs/common';

import { DOMAIN_EVENT_METADATA } from '../decorators';

export const defaultGetDomainEventIdHelper = <
  DomainEventBase extends IDomainEvent = IDomainEvent,
>(
  event: DomainEventBase,
): string => {
  const { constructor } = Object.getPrototypeOf(event);
  return Reflect.getMetadata(DOMAIN_EVENT_METADATA, constructor)?.id ?? null;
};

export const defaultReflectEventId = <
  DomainEventBase extends Type<IDomainEvent> = Type<IDomainEvent>,
>(
  event: DomainEventBase,
): string => {
  return Reflect.getMetadata(DOMAIN_EVENT_METADATA, event).id;
};
