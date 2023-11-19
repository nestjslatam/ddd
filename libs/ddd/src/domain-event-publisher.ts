/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';

import { DomainEventBus } from './domain-event-bus';
import { IDomainEvent } from './core';
import { DomainAggregateRoot } from './domain-aggregate-root';

export interface Constructor<T> {
  new (...args: any[]): T;
}

@Injectable()
export class DomainEventPublisher<
  DomainEventBase extends IDomainEvent = IDomainEvent,
> {
  constructor(private readonly eventBus: DomainEventBus<DomainEventBase>) {}

  /**
   * Merge the event publisher into the provided class.
   * This is required to make `publish` and `publishAll` available on the `AgreggateRoot` class.
   * @param metatype The class to merge into.
   */
  mergeClassContext<
    T extends Constructor<DomainAggregateRoot<any, DomainEventBase>>,
  >(metatype: T): T {
    const eventBus = this.eventBus;
    return class extends metatype {
      protected businessRules(props: any): void {
        //
      }
      publish(event: DomainEventBase) {
        eventBus.publish(event);
      }

      publishAll(events: DomainEventBase[]) {
        eventBus.publishAll(events);
      }
    };
  }

  /**
   * Merge the event publisher into the provided object.
   * This is required to make `publish` and `publishAll` available on the `AgreggateRoot` class instance.
   * @param object The object to merge into.
   */
  mergeObjectContext<T extends DomainAggregateRoot<any, DomainEventBase>>(
    object: T,
  ): T {
    const eventBus = this.eventBus;
    object.publish = (event: DomainEventBase) => {
      eventBus.publish(event);
    };

    object.publishAll = (events: DomainEventBase[]) => {
      eventBus.publishAll(events);
    };
    return object;
  }
}
