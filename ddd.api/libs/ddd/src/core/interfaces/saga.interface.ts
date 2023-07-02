import { Observable } from 'rxjs';
import { IDomainEvent } from './domain-event.interface';
import { ICommand } from './command.interface';

export type ISaga<
  EventBase extends IDomainEvent = IDomainEvent,
  CommandBase extends ICommand = ICommand,
> = (events$: Observable<EventBase>) => Observable<CommandBase>;
