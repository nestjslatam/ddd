import { Injectable } from '@nestjs/common';

import { DomainEvent } from './domaint-event';
import { DomainEventBus } from './domain-event-bus';
import { DomainAggregateRoot } from './domain-aggregate-root';

export interface Constructor<T> {
  new (...args: any[]): T;
}

@Injectable()
export class DomainEventPublisher<EventBase extends DomainEvent = DomainEvent> {
  constructor(private readonly eventBus: DomainEventBus<EventBase>) {}

  mergeClassContext<T extends Constructor<DomainAggregateRoot<any>>>(
    metatype: T,
  ): T {
    const eventBus = this.eventBus;
    return class extends metatype {
      public businessRules(): void {
        // TODO: How remove this?
      }

      publish(event: EventBase) {
        eventBus.publish(event);
      }

      publishAll(events: EventBase[]) {
        eventBus.publishAll(events);
      }
    };
  }

  mergeObjectContext<T extends DomainAggregateRoot<any>>(object: T): T {
    const eventBus = this.eventBus;
    object.publish = (event: EventBase) => {
      eventBus.publish(event);
    };

    object.publishAll = (events: EventBase[]) => {
      eventBus.publishAll(events);
    };
    return object;
  }
}
