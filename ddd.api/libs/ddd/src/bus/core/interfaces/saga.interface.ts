import { Observable } from 'rxjs';

import { ICommand } from './command.interface';
import { IDomainEvent } from '@nestjslatam/ddd';

export type ISaga<
  EventBase extends IDomainEvent = IDomainEvent,
  CommandBase extends ICommand = ICommand,
> = (events$: Observable<EventBase>) => Observable<CommandBase>;
