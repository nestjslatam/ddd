import { Subject } from 'rxjs';

import { IDomainCommand, IDomainCommandPublisher } from '../interfaces';

export class DefaultCommandPubSubHelper<CommandBase extends IDomainCommand>
  implements IDomainCommandPublisher<CommandBase>
{
  constructor(private subject$: Subject<CommandBase>) {}

  publish<T extends CommandBase>(domainCommand: T) {
    this.subject$.next(domainCommand);
  }
}
