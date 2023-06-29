import { Observable } from 'rxjs';

import { DomainEvent } from '../domaint-event';
import { IDomainCommand } from './domain-commands';

export type IDomainSaga<
  TDomainEvent extends DomainEvent = DomainEvent,
  TDomainCommand extends IDomainCommand = IDomainCommand,
> = (domainEvents$: Observable<TDomainEvent>) => Observable<TDomainCommand>;
