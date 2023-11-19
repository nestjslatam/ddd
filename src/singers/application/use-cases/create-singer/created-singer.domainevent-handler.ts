import { DomainEventsHandler, IDomainEventHandler } from '@nestjslatam/ddd-lib';

import { SingerCreatedDomainEvent } from '../../../domain/domain-events';

@DomainEventsHandler(SingerCreatedDomainEvent)
export class SingerCreatedDomainEventHandler
  implements IDomainEventHandler<SingerCreatedDomainEvent>
{
  handle(domainEvent: SingerCreatedDomainEvent) {
    console.log(
      `SingerCreatedDomainEventHandler: ${JSON.stringify(domainEvent)}`,
    );
  }
}
