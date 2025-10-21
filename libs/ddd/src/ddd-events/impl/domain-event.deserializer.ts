import { Injectable, Type } from '@nestjs/common';

import { ISerializableEvent } from '../interfaces';
import { DomainEventClsRegistry } from './domain-event-cli.registry';
import { DomainEvent } from './domain-event';

@Injectable()
export class DomainEventDeserializer {
  deserialize<T>(event: DomainEvent): ISerializableEvent<T> {
    const eventCls = this.getEventClassByType(event.type);
    return {
      ...event,
      data: this.instantiateSerializedEvent(eventCls, event.data),
    };
  }

  getEventClassByType(type: string) {
    return DomainEventClsRegistry.get(type);
  }

  instantiateSerializedEvent<T extends Type>(
    eventCls: T,
    data: Record<string, any>,
  ) {
    return Object.assign(Object.create(eventCls.prototype), data);
  }
}
