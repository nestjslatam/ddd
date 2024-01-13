import { DomainEventHandler, IDomainEventHandler } from '@nestjslatam/ddd-lib';

import { SingerSubscribedDomainEvent } from '../../../../domain/events';

@DomainEventHandler(SingerSubscribedDomainEvent)
export class SingerSubscribedDomainEventHandler
  implements IDomainEventHandler<SingerSubscribedDomainEvent>
{
  handle(domainEvent: SingerSubscribedDomainEvent) {
    console.log(
      `SingerSubscribedDomainEventHandler: ${JSON.stringify(domainEvent)}`,
    );
  }
}
