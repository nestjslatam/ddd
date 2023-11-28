import { Observable } from 'rxjs';

import { IDomainCommand } from './command.interface';
import { IDomainEvent } from './domain-event.interface';

export type ISaga<
  EventBase extends IDomainEvent = IDomainEvent,
  DomainCommandBase extends IDomainCommand = IDomainCommand,
> = (events$: Observable<EventBase>) => Observable<DomainCommandBase>;
