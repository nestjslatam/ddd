import { Observable } from 'rxjs';

import { ICommand } from './command.interface';
import { IDomainEvent } from './domain-event.interface';


export type ISaga<
  EventBase extends IDomainEvent = IDomainEvent,
  CommandBase extends ICommand = ICommand,
> = (events$: Observable<EventBase>) => Observable<CommandBase>;
