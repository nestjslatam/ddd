import { Observable } from 'rxjs';

import { IDomainEvent } from './../../ddd-events';
import { IDomainCommand } from './../../ddd-commands';

export type ISaga<
  EventBase extends IDomainEvent = IDomainEvent,
  DomainCommandBase extends IDomainCommand = IDomainCommand,
> = (events$: Observable<EventBase>) => Observable<DomainCommandBase>;
