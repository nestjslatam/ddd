import { DomainEventHandler, IDomainEventHandler } from '@nestjslatam/ddd-lib';

import { SingerCreatedDomainEvent } from '../../../../domain/domain-events';

@DomainEventHandler(SingerCreatedDomainEvent)
export class SingerCreatedDomainEventHandler
  implements IDomainEventHandler<SingerCreatedDomainEvent>
{
  handle(domainEvent: SingerCreatedDomainEvent) {
    console.log(
      `SingerCreatedDomainEventHandler: ${JSON.stringify(domainEvent)}`,
    );
  }
}
