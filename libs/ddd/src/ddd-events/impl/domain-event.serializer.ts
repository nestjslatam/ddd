import { Injectable } from '@nestjs/common';

import { DomainAggregateRoot } from '../../ddd-aggregate-root';
import { ISerializableEvent } from '../interfaces';

@Injectable()
export class DomainEventSerializer {
  serialize<T>(
    event: T,
    dispatcher: DomainAggregateRoot<any, any>,
  ): ISerializableEvent<T> {
    const eventType = event.constructor?.name;
    if (!eventType) {
      throw new Error('Incompatible event type');
    }

    const aggregateId = dispatcher.Id.getValue();

    return {
      aggregateId,
      position: dispatcher.version + 1,
      type: eventType,
      data: this.toJSON(event),
    };
  }

  private toJSON<T>(data: T) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if ('toJSON' in data && typeof data.toJSON === 'function') {
      return data.toJSON();
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.toJSON(item));
    }

    return Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = this.toJSON(value);
      return acc;
    }, {});
  }
}
