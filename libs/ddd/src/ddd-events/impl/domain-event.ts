import { v4 } from 'uuid';

import { IDomainEvent, IDomainEventMetadata } from '../interfaces';
import { DateTimeHelper } from '../../ddd-helpers';

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
