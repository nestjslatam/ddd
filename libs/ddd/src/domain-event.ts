import { v4 } from 'uuid';
import { IDomainEvent, IDomainEventMetadata } from './core';
import { DomainGuard } from '.';
import { DateTimeHelper } from './helpers';

export type DomainEventProps<T> = Omit<T, 'id' | 'metadata'> & {
  readonly aggregateId: string;
  readonly eventName: string;
  readonly data?: string;
  readonly metadata?: IDomainEventMetadata;
};

export abstract class DomainEvent implements IDomainEvent {
  readonly domainEventId: string;
  readonly aggregateId: string;
  readonly eventName: string;
  readonly data: string;
  readonly metadata: IDomainEventMetadata;

  constructor(props: DomainEventProps<unknown>) {
    if (DomainGuard.isEmpty(props))
      throw new Error('DomainEvent props is empty');

    try {
      this.domainEventId = v4().toString();
      this.eventName = props?.eventName || this.constructor.name;
      this.data = props?.data || JSON.stringify(this);
      this.metadata = {
        aggregateId: props?.aggregateId || '',
        trackingId: this.metadata?.trackingId,
        timestamp: Date.now(),
        ocurredOn: DateTimeHelper.getUtcDate(),
      };
    } catch (error) {
      throw new Error(`Error generating DomainEvent Id: ${error}`);
    }
  }
}
