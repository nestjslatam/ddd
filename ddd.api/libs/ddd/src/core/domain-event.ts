import { v4 } from 'uuid';
import { DateTimeHelper, DomainGuard } from '../helpers';
import { IDomainEvent } from './interfaces';

export type DomainEventMetadata = {
  readonly aggregateId: string;
  readonly timestamp: number;
  readonly data: string;
  readonly ocurredOn: Date;
};

export abstract class DomainEvent implements IDomainEvent {
  readonly domainEventId: string;
  readonly eventName: string;
  readonly metadata: DomainEventMetadata;

  constructor(props: { aggregateId: string; eventName: string }) {
    if (DomainGuard.isEmpty(props))
      throw new Error('DomainEvent props is empty');

    const { aggregateId, eventName } = props;

    try {
      this.domainEventId = v4().toString();
      this.eventName = eventName;
      this.metadata = {
        aggregateId,
        data: JSON.stringify(this),
        timestamp: Date.now(),
        ocurredOn: DateTimeHelper.getUtcDate(),
      };
    } catch (error) {
      throw new Error(`Error generating DomainEvent Id: ${error}`);
    }
  }
}
