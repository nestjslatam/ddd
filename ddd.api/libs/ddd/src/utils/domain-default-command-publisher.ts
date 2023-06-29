import { Subject } from 'rxjs';

import { IDomainCommand, IDomainCommandPublisher } from '../interfaces';

export class DomainDefaultCommandPublisher<
  TDomainCommand extends IDomainCommand,
> implements IDomainCommandPublisher<TDomainCommand>
{
  constructor(private subject$: Subject<TDomainCommand>) {}

  publish(domainCommand: TDomainCommand): void {
    if (!domainCommand) throw new Error('DomainCommand is required');

    this.subject$.next(domainCommand);
  }
}
