/**
 * Represents a domain event in the DDD (Domain-Driven Design) architecture.
 */
import { v4 } from 'uuid';

import { IDomainEvent, IDomainEventMetadata } from '../interfaces';
import { DateTimeHelper } from '../../ddd-helpers';
import { DomainEventException } from '../../ddd-exceptions';

/**
 * Properties for creating a domain event.
 */
export type DomainEventProps<T> = {
  readonly aggregateId?: string;
  readonly eventName?: string;
  readonly data?: T;
  readonly metadata?: IDomainEventMetadata;
};

/**
 * Abstract class for a domain event.
 */
export abstract class DomainEvent implements IDomainEvent {
  /**
   * The unique identifier of the domain event.
   */
  readonly domainEventId: string;
  /**
   * The identifier of the aggregate associated with the domain event.
   */
  readonly aggregateId: string;
  /**
   * The name of the domain event.
   */
  readonly eventName: string;
  /**
   * The data associated with the domain event.
   */
  readonly data: unknown;
  /**
   * The metadata associated with the domain event.
   */
  readonly metadata: IDomainEventMetadata;

  /**
   * Creates a new instance of the DomainEvent class.
   * @param props - The properties for creating the domain event.
   */
  constructor(props: DomainEventProps<unknown>) {
    try {
      this.domainEventId = v4().toString();
      this.eventName = props?.eventName || this.constructor.name;
      this.data = props?.data;
      this.metadata = {
        aggregateId: props?.aggregateId || '',
        trackingId: this.metadata?.trackingId,
        requestId: this.metadata?.requestId,
        timestamp: DateTimeHelper.getTimeStamp(),
        ocurredOn: DateTimeHelper.getUtcDate(),
      };
    } catch (error) {
      throw new DomainEventException(
        `${this.eventName}: Error generating DomainEvent Id: ${error}`,
      );
    }
  }
}
