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
export interface DomainEventProps {
  readonly aggregateId?: string;
  readonly type?: string;
  readonly position?: number;
  readonly eventName?: string;
  readonly data?: Record<string, any>;
  readonly metadata?: IDomainEventMetadata;
}

/**
 * Abstract class for a domain event.
 */
export abstract class DomainEvent implements IDomainEvent {
  /**
   * The unique identifier of the domain event.
   */
  readonly domainEventId: string;

  /**
   * The type of the domain event.
   */
  readonly type: string;

  /**
   * The position of the domain event in the sequence of events.
   */
  readonly position: number;

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
  readonly data: Record<string, any>;
  /**
   * The metadata associated with the domain event.
   */
  readonly metadata: IDomainEventMetadata;

  /**
   * Creates a new instance of the DomainEvent class.
   * @param props - The properties for creating the domain event.
   */
  constructor(props: DomainEventProps) {
    try {
      this.domainEventId = v4().toString();
      this.type = props.type || 'DomainEvent';
      this.position = props?.position || 0;
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
